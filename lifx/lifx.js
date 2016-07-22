module.exports = function(RED) {
    "use strict";
    var LifxClient = require('node-lifx').Client;
    var merge = require('merge');

    // The main node definition - most things happen in here
    function LifxNode(n) {
        var lx = new LifxClient();
        var node = this;
        var debug = !!n.debug;

        // Create a RED node
        RED.nodes.createNode(this, n);

        lx.on('light-new', function(light) {
            light.getLabel(function (err, label) {
                node.log('New bulb found: ' + label + " : " + light.id.toString("hex"));
            });
        });

        lx.init({
            debug: debug
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
                node.log("Powering " +  lightLabel + " " + state + "...");
                var light = lx.light(lightLabel);
                light[state]();
            }
        }

        function setColor(params, lightLabel) {
            if (lightLabel && params.hue && params.saturation && params.luminance) {
                var light = lx.light(lightLabel);
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


        // send initial values
        setPower(this.state.on, this.state.lightLabel);
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

        this.on('close', function() {
            lx.destroy();
            lx = null;
        });
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType('lifx', LifxNode);

};
