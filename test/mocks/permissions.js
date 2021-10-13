import { ethErrors, errorCodes } from 'eth-rpc-errors';
import deepFreeze from 'deep-freeze-strict';

import { CaveatTypes } from '../../shared/constants/permissions';
import { NOTIFICATION_NAMES } from '../../app/scripts/controllers/permissions/enums';

/**
 * README
 * This file contains three primary kinds of mocks:
 * - Mocks for initializing a permissions controller and getting a permissions
 * middleware
 * - Functions for getting various mock objects consumed or produced by
 * permissions controller methods
 * - Immutable mock values like Ethereum accounts and expected states
 */

export const noop = () => undefined;

/**
 * Mock Permissions Controller and Middleware
 */

const keyringAccounts = deepFreeze([
  '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
  '0xc42edfcc21ed14dda456aa0756c153f7985d8813',
  '0x7ae1cdd37bcbdb0e1f491974da8022bfdbf9c2bf',
  '0xcc74c7a59194e5d9268476955650d1e285be703c',
]);

const DOMAINS = {
  a: { origin: 'https://foo.xyz', host: 'foo.xyz' },
  b: { origin: 'https://bar.abc', host: 'bar.abc' },
  c: { origin: 'https://baz.def', host: 'baz.def' },
};

const PERM_NAMES = {
  eth_accounts: 'eth_accounts',
  test_method: 'test_method',
  does_not_exist: 'does_not_exist',
};

const ACCOUNTS = {
  a: {
    permitted: keyringAccounts.slice(0, 3),
    primary: keyringAccounts[0],
  },
  b: {
    permitted: [keyringAccounts[0]],
    primary: keyringAccounts[0],
  },
  c: {
    permitted: [keyringAccounts[1]],
    primary: keyringAccounts[1],
  },
};

/**
 * Helpers for getting mock caveats.
 */
const CAVEATS = {
  /**
   * Gets a correctly formatted eth_accounts exposedAccounts caveat.
   *
   * @param {Array<string>} accounts - The accounts for the caveat
   * @returns {Object} An eth_accounts exposedAccounts caveats
   */
  eth_accounts: (accounts) => {
    return [
      {
        type: CaveatTypes.restrictReturnedAccounts,
        value: accounts,
      },
    ];
  },
};

/**
 * Each function here corresponds to what would be a type or interface consumed
 * by permissions controller functions if we used TypeScript.
 */
const PERMS = {
  /**
   * The argument to approvePermissionsRequest
   * @param {string} id - The rpc-cap permissions request id.
   * @param {Object} permissions - The approved permissions, request-formatted.
   */
  approvedRequest: (id, permissions = {}) => {
    return {
      permissions: { ...permissions },
      metadata: { id },
    };
  },

  /**
   * Requested permissions objects, as passed to wallet_requestPermissions.
   */
  requests: {
    /**
     * @returns {Object} A permissions request object with eth_accounts
     */
    eth_accounts: () => {
      return { eth_accounts: {} };
    },

    /**
     * @returns {Object} A permissions request object with test_method
     */
    test_method: () => {
      return { test_method: {} };
    },

    /**
     * @returns {Object} A permissions request object with does_not_exist
     */
    does_not_exist: () => {
      return { does_not_exist: {} };
    },
  },

  /**
   * Finalized permission requests, as returned by finalizePermissionsRequest
   */
  finalizedRequests: {
    /**
     * @param {Array<string>} accounts - The accounts for the eth_accounts permission caveat
     * @returns {Object} A finalized permissions request object with eth_accounts and its caveat
     */
    eth_accounts: (accounts) => {
      return {
        eth_accounts: {
          caveats: CAVEATS.eth_accounts(accounts),
        },
      };
    },

    /**
     * @returns {Object} A finalized permissions request object with test_method
     */
    test_method: () => {
      return {
        test_method: {},
      };
    },
  },

  /**
   * Partial members of res.result for successful:
   * - wallet_requestPermissions
   * - wallet_getPermissions
   */
  granted: {
    /**
     * @param {Array<string>} accounts - The accounts for the eth_accounts permission caveat
     * @returns {Object} A granted permissions object with eth_accounts and its caveat
     */
    eth_accounts: (accounts) => {
      return {
        parentCapability: PERM_NAMES.eth_accounts,
        caveats: CAVEATS.eth_accounts(accounts),
      };
    },

    /**
     * @returns {Object} A granted permissions object with test_method
     */
    test_method: () => {
      return {
        parentCapability: PERM_NAMES.test_method,
      };
    },
  },
};

/**
 * Objects with function values for getting correctly formatted permissions,
 * caveats, errors, permissions requests etc.
 */
export const getters = deepFreeze({
  CAVEATS,

  PERMS,

  /**
   * Getters for errors by the method or workflow that throws them.
   */
  ERRORS: {
    validatePermittedAccounts: {
      invalidParam: () => {
        return {
          name: 'Error',
          message: 'Must provide non-empty array of account(s).',
        };
      },

      nonKeyringAccount: (account) => {
        return {
          name: 'Error',
          message: `Unknown account: ${account}`,
        };
      },
    },

    finalizePermissionsRequest: {
      grantEthAcountsFailure: (origin) => {
        return {
          // name: 'EthereumRpcError',
          message: `Failed to add 'eth_accounts' to '${origin}'.`,
          code: errorCodes.rpc.internal,
        };
      },
    },

    addPermittedAccount: {
      alreadyPermitted: () => {
        return {
          message: 'Account is already permitted for origin',
        };
      },
      invalidOrigin: () => {
        return {
          message: 'Unrecognized domain',
        };
      },
      noEthAccountsPermission: () => {
        return {
          message: `Origin does not have 'eth_accounts' permission`,
        };
      },
    },

    removePermittedAccount: {
      notPermitted: () => {
        return {
          message: 'Account is not permitted for origin',
        };
      },
      invalidOrigin: () => {
        return {
          message: 'Unrecognized domain',
        };
      },
      noEthAccountsPermission: () => {
        return {
          message: `Origin does not have 'eth_accounts' permission`,
        };
      },
    },

    _handleAccountSelected: {
      invalidParams: () => {
        return {
          name: 'Error',
          message: 'Selected account should be a non-empty string.',
        };
      },
    },

    approvePermissionsRequest: {
      noPermsRequested: () => {
        return {
          message: 'Must request at least one permission.',
        };
      },
    },

    rejectPermissionsRequest: {
      rejection: () => {
        return {
          message: ethErrors.provider.userRejectedRequest().message,
        };
      },
      methodNotFound: (methodName) => {
        return {
          message: `The method '${methodName}' does not exist / is not available.`,
        };
      },
    },

    createMiddleware: {
      badOrigin: () => {
        return {
          message: 'Must provide non-empty string origin.',
        };
      },
    },

    rpcCap: {
      unauthorized: () => {
        return {
          code: 4100,
        };
      },
    },

    pendingApprovals: {
      duplicateOriginOrId: (id, origin) => {
        return {
          message: `Pending approval with id '${id}' or origin '${origin}' already exists.`,
        };
      },
      requestAlreadyPending: (origin) => {
        return {
          message: `Request of type 'wallet_requestPermissions' already pending for origin ${origin}. Please wait.`,
        };
      },
    },

    eth_requestAccounts: {
      requestAlreadyPending: () => {
        return {
          message: 'Already processing eth_requestAccounts. Please wait.',
        };
      },
    },

    notifyAccountsChanged: {
      invalidOrigin: (origin) => {
        return {
          message: `Invalid origin: '${origin}'`,
        };
      },
      invalidAccounts: () => {
        return {
          message: 'Invalid accounts',
        };
      },
    },
  },

  /**
   * Getters for notifications produced by the permissions controller.
   */
  NOTIFICATIONS: {
    /**
     * Gets a removed accounts notification.
     *
     * @returns {Object} An accountsChanged notification with an empty array as its result
     */
    removedAccounts: () => {
      return {
        method: NOTIFICATION_NAMES.accountsChanged,
        params: [],
      };
    },

    /**
     * Gets a new accounts notification.
     *
     * @param {Array<string>} accounts - The accounts added to the notification.
     * @returns {Object} An accountsChanged notification with the given accounts as its result
     */
    newAccounts: (accounts) => {
      return {
        method: NOTIFICATION_NAMES.accountsChanged,
        params: accounts,
      };
    },
  },

  /**
   * Getters for mock RPC request objects.
   */
  RPC_REQUESTS: {
    /**
     * Gets an arbitrary RPC request object.
     *
     * @param {string} origin - The origin of the request
     * @param {string} method - The request method
     * @param {Array<any>} params - The request parameters
     * @param {string} [id] - The request id
     * @returns {Object} An RPC request object
     */
    custom: (origin, method, params = [], id) => {
      const req = {
        origin,
        method,
        params,
      };
      if (id !== undefined) {
        req.id = id;
      }
      return req;
    },

    /**
     * Gets an eth_accounts RPC request object.
     *
     * @param {string} origin - The origin of the request
     * @returns {Object} An RPC request object
     */
    eth_accounts: (origin) => {
      return {
        origin,
        method: 'eth_accounts',
        params: [],
      };
    },

    /**
     * Gets a test_method RPC request object.
     *
     * @param {string} origin - The origin of the request
     * @param {boolean} param - The request param
     * @returns {Object} An RPC request object
     */
    test_method: (origin, param = false) => {
      return {
        origin,
        method: 'test_method',
        params: [param],
      };
    },

    /**
     * Gets an eth_requestAccounts RPC request object.
     *
     * @param {string} origin - The origin of the request
     * @returns {Object} An RPC request object
     */
    eth_requestAccounts: (origin) => {
      return {
        origin,
        method: 'eth_requestAccounts',
        params: [],
      };
    },

    /**
     * Gets a wallet_requestPermissions RPC request object,
     * for a single permission.
     *
     * @param {string} origin - The origin of the request
     * @param {string} permissionName - The name of the permission to request
     * @returns {Object} An RPC request object
     */
    requestPermission: (origin, permissionName) => {
      return {
        origin,
        method: 'wallet_requestPermissions',
        params: [PERMS.requests[permissionName]()],
      };
    },

    /**
     * Gets a wallet_requestPermissions RPC request object,
     * for multiple permissions.
     *
     * @param {string} origin - The origin of the request
     * @param {Object} permissions - A permission request object
     * @returns {Object} An RPC request object
     */
    requestPermissions: (origin, permissions = {}) => {
      return {
        origin,
        method: 'wallet_requestPermissions',
        params: [permissions],
      };
    },

    /**
     * Gets a metamask_sendDomainMetadata RPC request object.
     *
     * @param {string} origin - The origin of the request
     * @param {Object} name - The domainMetadata name
     * @param {Array<any>} [args] - Any other data for the request's domainMetadata
     * @returns {Object} An RPC request object
     */
    metamask_sendDomainMetadata: (origin, name, ...args) => {
      return {
        origin,
        method: 'metamask_sendDomainMetadata',
        params: {
          ...args,
          name,
        },
      };
    },
  },
});

/**
 * Objects with immutable mock values.
 */
export const constants = deepFreeze({
  ALL_ACCOUNTS: keyringAccounts,

  DUMMY_ACCOUNT: '0xabc',

  EXTRA_ACCOUNT: keyringAccounts[3],

  REQUEST_IDS: {
    a: '1',
    b: '2',
    c: '3',
  },

  DOMAINS: { ...DOMAINS },

  ACCOUNTS: { ...ACCOUNTS },

  PERM_NAMES: { ...PERM_NAMES },

  RESTRICTED_METHODS: ['eth_accounts', 'test_method'],

  /**
   * Mock permissions history objects.
   */
  EXPECTED_HISTORIES: {
    case1: [
      {
        [DOMAINS.a.origin]: {
          [PERM_NAMES.eth_accounts]: {
            lastApproved: 1,
            accounts: {
              [ACCOUNTS.a.permitted[0]]: 1,
              [ACCOUNTS.a.permitted[1]]: 1,
              [ACCOUNTS.a.permitted[2]]: 1,
            },
          },
        },
      },
      {
        [DOMAINS.a.origin]: {
          [PERM_NAMES.eth_accounts]: {
            lastApproved: 2,
            accounts: {
              [ACCOUNTS.a.permitted[0]]: 2,
              [ACCOUNTS.a.permitted[1]]: 1,
              [ACCOUNTS.a.permitted[2]]: 1,
            },
          },
        },
      },
    ],

    case2: [
      {
        [DOMAINS.a.origin]: {
          [PERM_NAMES.eth_accounts]: {
            lastApproved: 1,
            accounts: {},
          },
        },
      },
    ],

    case3: [
      {
        [DOMAINS.a.origin]: {
          [PERM_NAMES.test_method]: { lastApproved: 1 },
        },
        [DOMAINS.b.origin]: {
          [PERM_NAMES.eth_accounts]: {
            lastApproved: 1,
            accounts: {
              [ACCOUNTS.b.permitted[0]]: 1,
            },
          },
        },
        [DOMAINS.c.origin]: {
          [PERM_NAMES.test_method]: { lastApproved: 1 },
          [PERM_NAMES.eth_accounts]: {
            lastApproved: 1,
            accounts: {
              [ACCOUNTS.c.permitted[0]]: 1,
            },
          },
        },
      },
      {
        [DOMAINS.a.origin]: {
          [PERM_NAMES.test_method]: { lastApproved: 2 },
        },
        [DOMAINS.b.origin]: {
          [PERM_NAMES.eth_accounts]: {
            lastApproved: 1,
            accounts: {
              [ACCOUNTS.b.permitted[0]]: 1,
            },
          },
        },
        [DOMAINS.c.origin]: {
          [PERM_NAMES.test_method]: { lastApproved: 1 },
          [PERM_NAMES.eth_accounts]: {
            lastApproved: 2,
            accounts: {
              [ACCOUNTS.c.permitted[0]]: 1,
              [ACCOUNTS.b.permitted[0]]: 2,
            },
          },
        },
      },
    ],

    case4: [
      {
        [DOMAINS.a.origin]: {
          [PERM_NAMES.test_method]: {
            lastApproved: 1,
          },
        },
      },
    ],
  },
});