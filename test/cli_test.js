import chai, { expect } from 'chai'

import cli from '../src2/cli'
import { NoCommandGiven, NoWatchesGiven, InvalidSignalGiven } from '../src2/errors'


describe("The CLI parser", function() {

  it("should identify the command to run", function() {
    const options = parse('file -- cmd arg1 arg2')
    expect(options.command).to.deep.equal([ 'cmd', 'arg1', 'arg2' ])
  })


  it("should identify the files to watch", function() {
    const options = parse('file1 file2 -- cmd')
    expect(options.watches).to.deep.equal([ 'file1', 'file2' ])
  })


  it("should fail if no command is given", function() {
    expect(parser('')).to.throw(NoCommandGiven)
    expect(parser('foo bar')).to.throw(NoCommandGiven)
  })


  it("should fail if no files are given to watch", function() {
    expect(parser('-- cmd')).to.throw(NoWatchesGiven)
  })


  it("should handle the -g and --group flags", function() {
    let options = parse('file -- cmd')
    expect(options.g).to.be.false
    expect(options.group).to.be.false

    options = parse('file -g -- cmd')
    expect(options.g).to.be.true
    expect(options.group).to.be.true

    options = parse('file --group -- cmd')
    expect(options.g).to.be.true
    expect(options.group).to.be.true
  })


  describeBooleanFlag('w', 'wait')
  describeBooleanFlag('g', 'group')
  describeBooleanFlag('p', 'parallel')


  it("should indentify the -s and --signal flags", function() {
    let options

    options = parse('file -- cmd')
    expect(options.s).to.equal('SIGINT')
    expect(options.signal).to.equal('SIGINT')

    for (let flag of [ '-s', '--signal' ])
    for (let signal of ['SIGHUP', 'SIGINT', 'SIGTERM', 'SIGKILL']) {
      options = parse(`file ${flag} ${signal} -- cmd`)
      expect(options.s).to.equal(signal)
      expect(options.signal).to.equal(signal)
    }
  })


  it("should reject signals other than HUP, INT, TERM and KILL", function() {
    // For this test to be absolutely complete, all other Unix signals should
    // be tested. I don't think it's necessary.
    expect(parser(`file -s SIGPIPE -- cmd`)).to.throw(InvalidSignalGiven)
  })
})


function describeBooleanFlag(short, long) {
  it(`should indentify the -${short} and --${long} flags`, function() {
    let options

    options = parse('file -- cmd')
    expect(options[short]).to.be.false
    expect(options[long]).to.be.false

    options = parse(`file -${short} -- cmd`)
    expect(options[short]).to.be.true
    expect(options[long]).to.be.true

    options = parse(`file --${long} -- cmd`)
    expect(options[long]).to.be.true
    expect(options[short]).to.be.true
  })
}


function parser(line) {
  const argv = line.split(/\s+/g)
  return () => cli.parse([ 'node', 'relo.js' ].concat(argv))  
}

function parse(line) {
  return parser(line)()  
}
