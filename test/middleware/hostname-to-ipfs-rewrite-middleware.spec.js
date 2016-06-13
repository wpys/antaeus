/* eslint-env mocha */
'use strict'

const fs = require('fs')
const sinon = require('sinon')
const expect = require('chai').expect

const hostnameToIPFSRewrite = require('../../src/middleware/hostname-to-ipfs-rewrite-middleware')

describe('Hostname Rewrite Middleware', () => {
  let dnsConfig = null
  let middleware = null

  before(() => {
    dnsConfig = JSON.parse(fs.readFileSync('./test/exampleDNSConfig.json'))
  })

  beforeEach(() => {
    middleware = hostnameToIPFSRewrite.rewrite(dnsConfig)
  })

  describe('mapping from hostname to ipfs entry', () => {
    let req = {}
    let res = {}
    let next = null

    beforeEach(() => {
      req.url = '/'
      next = sinon.spy()
    })

    describe('for a known dns entry', () => {
      beforeEach(() => {
        req.hostname = 'www.example.com'
        middleware(req, res, next)
      })

      it('rewrites the url based on the IPFS entry', () => {
        expect(req.url).to.equal('/ipfs/QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
      })

      it('passes control onto the next middleware', () => {
        expect(next.calledOnce).to.equal(true)
      })
    })

    describe('for an unknown dns entry', () => {
      beforeEach(() => {
        req.hostname = 'www.unknown.com'
        middleware(req, res, next)
      })

      it('leaves the url untouched', () => {
        expect(req.url).to.equal('/')
      })

      it('passes control onto the next middleware', () => {
        expect(next.calledOnce).to.equal(true)
      })
    })
  })
})
