/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const expect = require('chai').expect

describe('Routes', () => {
  const homeEndpoints = require('../src/controllers/home')

  describe('GET /', () => {
    let req = {
      app: {
        get: function () {
          return {
            addresses: [
              '/ip4/127.0.0.1/tcp/4001/ipfs/QmVaUD4sack94cZCWEcQsVVTH3MfBaSKGoX368VREwVEgP',
              '/ip4/192.168.1.251/tcp/4001/ipfs/QmVaUD4sack94cZCWEcQsVVTH3MfBaSKGoX368VREwVEgP',
              '/ip6/::1/tcp/4001/ipfs/QmVaUD4sack94cZCWEcQsVVTH3MfBaSKGoX368VREwVEgP',
              '/ip4/86.139.131.174/tcp/38316/ipfs/QmVaUD4sack94cZCWEcQsVVTH3MfBaSKGoX368VREwVEgP'
            ]
          }
        }
      }
    }
    let res = {}
    let expectedHomeDetails = {
      title: 'Antaeus',
      addresses: ['/ip4/192.168.1.251/tcp/4001/ipfs/QmVaUD4sack94cZCWEcQsVVTH3MfBaSKGoX368VREwVEgP']
    }

    beforeEach(() => {
      res.render = sinon.spy()
      homeEndpoints.antaeusWelcomeMessage(req, res)
    })

    it('show the welcome message and swarm connect address', () => {
      expect(res.render.calledWith('home', expectedHomeDetails)).to.equal(true)
    })
  })

  describe('GET /ipfs/...', () => {
    let ipfs = {}
    let logger = {
      error: function noop () {}
    }
    let req = {
      url: '/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u',
      app: { get: (name) => { return name === 'logger' ? logger : ipfs } }
    }
    let res = {}

    let requestedFile = {}
    let requestedIndexFile = {}

    beforeEach(() => {
      ipfs.send = sinon.stub()

      requestedFile.pipe = sinon.spy()
      requestedIndexFile.pipe = sinon.spy()

      res.status = sinon.stub()
      res.send = sinon.spy()
      res.contentType = sinon.stub()
      res.status.returnsThis()
      res.contentType.returnsThis()
    })

    describe('an individual file', () => {
      describe('looked up by a valid address', () => {
        beforeEach(() => {
          ipfs.send.callsArgWith(1, null, requestedFile)
          homeEndpoints.routeToIPFS(req, res)
        })

        it('lookups up the ipfs node', () => {
          expect(ipfs.send.getCall(0).args[0].args).to.equal('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
        })

        it('returns the file', () => {
          expect(requestedFile.pipe.calledOnce).to.equal(true)
        })
      })

      describe('looked up by a valid address with a query string', () => {
        beforeEach(() => {
          req.url += '?q=example'
          ipfs.send.callsArgWith(1, null, requestedFile)
          homeEndpoints.routeToIPFS(req, res)
        })

        it('looks up the ipfs node', () => {
          expect(ipfs.send.getCall(0).args[0].args).to.equal('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
        })
      })

      describe('looked up by an invalid address', () => {
        beforeEach(() => {
          ipfs.send.callsArgWith(1, { code: 0, message: 'Not a valid address' }, null)
          homeEndpoints.routeToIPFS(req, res)
        })

        it('returns a 404 http status code', () => {
          expect(res.status.calledWith(404)).to.equal(true)
        })

        it('returns the error message', () => {
          expect(res.send.calledWith('Path Resolve error: Not a valid address')).to.equal(true)
        })
      })
    })

    describe('a directory', () => {
      describe('looked up by a valid address', () => {
        beforeEach(() => {
          ipfs.send.onFirstCall().callsArgWith(1, { message: 'this dag node is a directory' }, null)
        })

        describe('with an index.html file', () => {
          beforeEach(() => {
            ipfs.send.onSecondCall().callsArgWith(1, null, requestedIndexFile)
            homeEndpoints.routeToIPFS(req, res)
          })

          it('returns the index.html page', () => {
            expect(requestedIndexFile.pipe.calledOnce).to.equal(true)
          })
        })

        describe('without an index.html file', () => {
          beforeEach(() => {
            ipfs.send.onSecondCall().callsArgWith(1, 'Not a valid address', null)
            homeEndpoints.routeToIPFS(req, res)
          })

          it('returns a 500 status code', () => {
            expect(res.status.calledWith(500)).to.equal(true)
          })

          it('returns the error message', () => {
            expect(res.send.calledWith('Not a valid address')).to.equal(true)
          })
        })
      })
    })

    describe('on an erroring ipfs node', () => {
      beforeEach(() => {
        ipfs.send.callsArgWith(1, { code: 321, message: 'Internal error' }, null)
        homeEndpoints.routeToIPFS(req, res)
      })

      it('returns a 500 http status code', () => {
        expect(res.status.calledWith(500)).to.equal(true)
      })

      it('returns the error message', () => {
        expect(res.send.calledWith('Internal error')).to.equal(true)
      })
    })
  })
})
