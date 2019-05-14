import * as _ from 'lodash';
import { NetworkId } from '../types';

const networkToAddresses: { [networkId: number]: string } = {
  1: '',
  3: '0xbfdb9397842776dbf3c0e3160e941d1542ab0365',
};

function getContractAddressesForNetworkOrThrow(networkId: NetworkId): string {
  if (_.isUndefined(networkToAddresses[networkId])) {
    throw new Error(
      `Unknown network id (${networkId}).
      No known diaspore contracts have been deployed on this network.`,
    );
  }
  return networkToAddresses[networkId];
}

/**
 * Returns the default diaspore addresses for the given networkId or throws with
 * a context-specific error message if the networkId is not recognized.
 */
export default function getDefaultContractAddresses(networkId: NetworkId): string {
  if (!(networkId in NetworkId)) {
    throw new Error(
      `No default contract addresses found for the given network id (${networkId}).
      If you want to use ContractWrappers on this network,
      you must manually pass in the contract address(es) to the constructor.`,
    );
  }
  return getContractAddressesForNetworkOrThrow(networkId);
}
