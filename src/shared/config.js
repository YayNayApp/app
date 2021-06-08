import { NetworkType } from '@airgap/beacon-sdk'
import { validateDate } from './utils'

export const TEZOS_NETWORK_DEFAULT = 'edonet'
export const TEZOS_NETWORKS = {
  mainnet: {
    rpc: 'https://mainnet.smartpy.io',
    type: NetworkType.MAINNET,
    label: 'Main',
    tzstats: 'https://tzstats.com',
  },
  florencenet: {
    rpc: 'https://florencenet.smartpy.io',
    type: NetworkType.FLORENCENET,
    label: 'Florence',
    tzstats: 'https://florence.tzstats.com',
  },
  edonet: {
    rpc: 'https://edonet.smartpy.io',
    type: NetworkType.EDONET,
    label: 'Edo',
    testnet: true,
    tezid: 'KT1VxsgqQXwk3LfwspJXnj3m89UXCq6RFN6G',
    tzstats: 'https://edo.tzstats.com',
    tzstats_api: 'https://api.edo.tzstats.com',
  },
}

export const VOTING_PROCEDURES = [
  {
    id: 1,
    name: 'Simple Majority',
    representation: '1p1v',
    choice: 'binary',
    secret: false,
    options: [
      {
        name: 'name',
        label: 'Name the vote',
        placeholder: 'Name (max 30 characters)',
        description: 'The name is used in lists, searches and different views on YayNay.',
        type: 'text',
        required: true,
        maxLength: 30,
        validate: (value) => {
          if (!value) throw new Error('Name is required')
          if (value === '') throw new Error('Name is required')
          if (value.length > 30) throw new Error('Maximum 30 characters allowed')
          return true
        }
      },
      {
        name: 'question',
        label: 'What question are you voting over?',
        placeholder: 'Question (max 100 characters)',
        description: 'The question is what you are asking your your electorate to make decision about.',
        type: 'text',
        required: true,
        maxLength: 100,
        validate: (value) => {
          if (!value) throw new Error('Question is required')
          if (value === '') throw new Error('Question is required')
          if (value.length > 100) throw new Error('Maximum 100 characters allowed')
          return true
        }
      },
      {
        name: 'proofs',
        type: 'tezid',
        label: 'Who can vote?',
        proofOptions: [{ label: 'Email', key: 'email'}, { label: 'Phone', key: 'phone' }],
        required: true, 
        validate: (value) => {
          if (!value) throw new Error('Minimum 1 proof required')
          if (value.length === 0) throw new Error('Minimum 1 proof required')
          return true
        }
      },
      {
        name: 'cost',
        label: 'Should casting a vote have a cost?',
        placeholder: 'Cost (0 = no cost)',
        description: 'Sometimes you might want to require a cost for casting a vote. This could be to set incentives, fundraise etc. Value in Mutez',
        type: 'number',
        required: true,
        validate: (value) => {
          let _value = parseInt(value)
          if (typeof(_value) !== 'number') throw new Error('Must be a number')
          if (isNaN(_value)) throw new Error('Must be a number')
          if (_value < 0) throw new Error('Must be a positive number or 0')
          return true
        }
      },
      {
        name: 'start',
        label: 'Start date',
        description: 'Set a time when voting starts. Particpants cannot vote before this time. This input uses the datetime-local type. If you do not see a datetime selector, input the following date format manually: yyyy-MM-ddThh:mm:ss',
        type: 'timestamp',
        required: true,
        validate: validateDate
      },
      {
        name: 'end',
        label: 'End date',
        description: 'Set a time when voting ends. Particpants cannot vote after this time. The vote can be resolved only after this time. This input uses the datetime-local type. If you do not see a datetime selector, input the following date format manually: yyyy-MM-ddThh:mm:ss',
        type: 'timestamp',
        required: true,
        validate: validateDate
      },
      {
        name: 'majority',
        label: 'Required majority',
        placeholder: 'Majority (in %)',
        description: 'What majority is required in order to resolve this vote as passed?',
        type: 'number',
        min: 0,
        max: 100,
        step: 1,
        required: true,
        validate: (value) => {
          let _value = parseInt(value)
          if (typeof(_value) !== 'number') throw new Error('Must be a number')
          if (isNaN(_value)) throw new Error('Must be a number')
          if (_value < 0 || _value > 100) throw new Error('Must be a positive number between 0 and 100')
          return true
        }
      },
      {
        name: 'participationLimit',
        label: 'Maximum participants',
        placeholder: 'Participants (0 = no limit)',
        description: 'Sometimes you might want to cap the number of allowed participants for a vote.',
        type: 'number',
        required: true,
        validate: (value) => {
          let _value = parseInt(value)
          if (typeof(_value) !== 'number') throw new Error('Must be a number')
          if (isNaN(_value)) throw new Error('Must be a number')
          if (_value < 0) throw new Error('Must be a positive number or 0')
          return true
        }
      },
    ],
    code: './contracts/1_code.json',
    storage: './contracts/1_storage.json'
  },
  {
    id: 2,
    name: 'Quadratic Majority',
    disabled: 'true',
    representation: 'quadratic',
    choice: 'binary',
    secret: false,
    options: []
  },
  {
    id: 3,
    name: 'Quadratic Majority ZK',
    disabled: 'true',
    representation: 'quadratic',
    choice: 'binary',
    secret: true,
    options: []
  },
  {
    id: 4,
    name: 'First Past the Post',
    disabled: 'true',
    representation: '1p1v',
    choice: 'multiple',
    secret: false,
    options: []
  },
  {
    id: 5,
    name: '...much more to come!',
    disabled: 'true',
    representation: '1p1v',
    choice: 'multiple',
    secret: true,
    resolve: 'function',
    options: []
  }
]
