Antaeus - IPFS Gateway with hostname rewriting
==============================================
[![aegir](https://img.shields.io/badge/follows-aegir-blue.svg?style=flat-square)](https://github.com/dignifiedquire/aegir)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![Coverage Status](https://coveralls.io/repos/github/kanej/antaeus/badge.svg?branch=master)](https://coveralls.io/github/kanej/antaeus?branch=master)
[![Dependency Status](https://david-dm.org/kanej/antaeus.svg?style=flat-square)](https://david-dm.org/kanej/antaeus)
[![CircleCI](https://circleci.com/gh/kanej/antaeus.svg?style=svg)](https://circleci.com/gh/kanej/antaeus)
> The giant then reached out the hands in haste
> Whose mighty grip was felt by Hercules
> And took my guide. Feeling himself embraced,
> Virgil looked down and said: "Come closer, please:
> It's your turn." Inferno, Canto 31

Antaeus is a node webserver that wraps the IPFS daemon.
It allows you to define a mapping from a hostname to an IPFS address,
so that you can serve a website from IPFS on a root domain name.

Install
-------
Antaeus requires the ipfs client and daemon to be installed and running. It is packaged as an npm module:

```bash
$ npm install -g antaeus
```

This will install a command line program `antaeus` that can be used to start the webserver:

```bash
$ antaeus start --port 8080 --dnsConfig dnsMapping.json
```

The dns mapping file is a json map from hostnames to ipfs addresses:

```json
{
  "www.example.com": "/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u"
}
```

Once started, you will need to modify your hosts file to test the mapping in the browser.
You can test with `curl` more directly by setting the appropriate hostname:

```bash
$ curl -H 'Host: www.example.com' localhost:8080 # Hello World
```

The dns mapping file can be loaded from ipfs itself. The `dnsConfig` option accepts an ipfs address:

```bash
$ ipfs add dnsMapping.json
added QmeUrP9wiBxBv9GA7D22F8n5gNok4uMmBeZWkarmAwBJHD dnsMapping.json
$ antaeus start --port 8080 --dnsConfig QmeUrP9wiBxBv9GA7D22F8n5gNok4uMmBeZWkarmAwBJHD
```

Development
-----------
The main entry point is `src/index.js`, so to start the server for development run:
```bash
$ nodemon src/index test/exampleDNSConfig.json
```

To run the tests:
```bash
$ npm test
```

To lint the code:
```bash
$ npm run lint
```

To get the test coverage:
```bash
$ npm run coverage
```

License
-------
MIT
