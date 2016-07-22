# LIFX (2.0 protocol) control node for Node-RED

[![published at npm](https://img.shields.io/npm/v/node-red-contrib-lifx2.svg)](https://www.npmjs.org/package/node-red-contrib-lifx2)

With this node you can control [LIFX](http://lifx.co/) light bulbs that has firmware v2.0 using [Node-RED](http://nodered.org/). The module is mostly a wrapper for unofficial (but great) [node-lifx library](https://github.com/MariusRumpf/node-lifx).

## Firmware Compatibility

This node depends on node-lifx library version 0.6.0, which should be compatible with the latest versions of LIFX firmware (2.0 was tested).

If you use older versions of firmware, just use node-red-contrib-lifx instead (the library I've used/forked to do this one).

## Installation

You can install [latest release from npm](https://www.npmjs.org/package/node-red-contrib-lifx2). In your Node-RED directory run:

    npm install node-red-contrib-lifx2

Alternatively you can clone repository into `nodes/` directory and install npm dependencies manually:

    cd path/to/node-red/
    cd nodes
    git clone https://github.com/diegopamio/node-red-contrib-lifx2
    cd node-red-contrib-lifx2
    npm install

Once you restart Node-RED server, there should be a _lifx_ node available in the nodes palette under _output_ category.

![output > lifx](https://cloud.githubusercontent.com/assets/616767/4834675/08ec1df2-5fb0-11e4-905a-89c8cbe08e9f.png)

## Usage

On every received message node sends commands to the light specified in "lightLabel" field.

Initial configuration can be set through node's configuration options, including `debug` mode for underlying lifxjs library, which dumps network communication. Node will send initial configuration to light bulbs each time the graph is deployed.

![lifx node configuration example](https://cloud.githubusercontent.com/assets/616767/4834356/034839c4-5fad-11e4-946a-e901ac80b536.png)

### Parameters

Both initial configuration and message works with the following parameters, which are passed to node-lifx library:

* `on` (bool) – whether the light should be on, or off; `true` by default
* `hue` (uint16) – primary color of light; `0xCC15` by default
* `saturation` (uint16) – “how much of color” to use, generally `0x0000` for white and `0xFFFF` for full color; `0xFFFF` by default
* `luminance` (uint16) – light intensity; `0x8000` by default
* `whiteColor` (uint16) – color temperature (?); `0x0000` by default
* `fadeTime` (uint32) – how quickly the new state should be changed, `0` causes an immediate change, maximum is `0xFFFFFFFF`; `0x0513` by default

Numbers can be passed as strings too.

### Input

Node expects a message with the following structure:

```js
{
    payload: {
        on: true,
        hue: 0xCC15,
        // etc…
    }
}
```

`msg.payload` is an object with none, some, or all parameters. Input parameters are stored and merged with previously passed parameters (or defaults) and then sent to light bulbs.

Therefore you can change only one parameter in the payload and the rest will be remembered and resent.

### Output

On received message node sends a payload with its current stored state. E.g.:

```js
{
    payload: {
        on: true,
        hue: '0xCC15',
        saturation: '0xFFFF',
        luminance: '0x8000',
        whiteColor: '',
        fadeTime: '0x0513'
    }
}
```

## TODO

* Expose more LIFX functions as standalone nodes (e.g. waveform, relative and absolute dim)
* Allow targeting of individual bulbs instead of the whole mesh (i.e. through configuration node?)
* Connection sharing for multiple nodes (especially on close; there'll probably have to be a global connection singleton)

## See also

* [lifx-alert](https://github.com/TinajaLabs/lifx-alert/) (Node-RED) lets you set red, green or orange color.
* [node-red-contrib-lifx] (Node-RED) the 1.x version.
* [hue](https://github.com/node-red/node-red-nodes/tree/master/hardware/hue) (Node-RED) for Phillips Hue.
