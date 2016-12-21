module.exports = function(RED) {
    "use strict";
    var merge = require('merge');

    // This is a config node holding the Client
    function LifxClientNode(n) {
        var LifxClient = require('node-lifx').Client;
        var lx = new LifxClient();
        this.lx = lx;
        RED.nodes.createNode(this, n);

        this.on('close', function() {
            lx.destroy();
            lx = null;
        });

        lx.init();

    }

    RED.nodes.registerType('lifx-client', LifxClientNode);


    // The main node definition - most things happen in here
    function LifxNode(n) {
        var node = this;
        node.lx = RED.nodes.getNode(n.lx).lx;
        // Create a RED node
        RED.nodes.createNode(this, n);

        node.lx.on('light-new', function(light) {
            light.getLabel(function (err, label) {
                node.log('New bulb found: ' + label + " : " + light.id.toString("hex"));
            });
        });

        // Set default values from node configuration
        this.state = {
            lightLabel: n.lightLabel,
            on: !!n.on,
            hue: n.hue,
            saturation: n.saturation,
            luminance: n.luminance,
            whiteColor: n.whiteColor,
            fadeTime: n.fadeTime
        };

        function setPower(state, lightLabel) {
            if (lightLabel) {
                var light = node.lx.light(lightLabel);
                if (light) {
                    node.log("Powering " +  lightLabel + " " + state + "...");
                    light[state]();
                }
            }
        }

        function setColor(params, lightLabel) {
            if (lightLabel && params.hue && params.saturation && params.luminance) {
                var light = node.lx.light(lightLabel);
                if (light) {
                    node.log("Setting color: " + JSON.stringify(params));

                    light.color(
                        parseInt(params.hue),
                        parseInt(params.saturation),
                        parseInt(params.luminance),
                        parseInt(params.whiteColor),
                        parseFloat(params.fadeTime)
                    );
                }
            }
        }


        // send initial values
        setPower(this.state.on? 'on':'off', this.state.lightLabel);
        setColor(this.state, this.state.lightLabel);

        // respond to inputs....
        this.on('input', function (msg) {
            var payload = msg.payload;
            this.state = merge(this.state, payload);

            setPower(this.state.on? 'on':'off', this.state.lightLabel);
            setColor(this.state, this.state.lightLabel);

            var out = {
                payload: this.state
            };
            this.send(out);
        });

    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType('lifx', LifxNode);

    // new node : lifx state retrieval
    function LifxStateNode(n) {
      var node = this;
      node.lx = RED.nodes.getNode(n.lx).lx;
      // Create a RED node
      RED.nodes.createNode(this, n);

      node.lx.on('light-new', function(light) {
          light.getLabel(function (err, label) {
              node.log('New bulb found: ' + label + " : " + light.id.toString("hex"));
          });
      });

      // Set default values from node configuration
      this.state = {
          lightLabel: n.lightLabel
      };

      // respond to inputs....
      this.on('input', function (msg) {
          var payload = msg.payload;
          this.state = merge(this.state, payload);

          var light = node.lx.light(this.state.lightLabel);
          if (light) {
            light.getState(function (err, cstate) {
              if (cstate) {
                // node.log('Got state: ' + cstate.label + " : HSK=" + cstate.color.hue + "/" + cstate.color.saturation + "/" + cstate.color.kelvin + " (" + cstate.color.brightness +")");
                var out = {
                  payload: {
                    lightLabel: cstate.label,
                    hue: cstate.color.hue,
                    saturation: cstate.color.saturation,
                    luminance: cstate.color.brightness,
                    whiteColor: cstate.color.kelvin,
                    on: cstate.power==1
                  }
                };

                node.send(out);

              } // cstate
            }); // cb:getState

          } // light

      });

    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType('lifx-state', LifxStateNode);

};
