import { Oracle } from '@jpgonzalezra/diaspore-contract-artifacts';
import { ContractAbi } from 'ethereum-types';
import axios from 'axios';
import * as ethUtil from 'ethereumjs-util';

import { OracleContract } from '@jpgonzalezra/abi-wrappers';

/**
 * This class includes the functionality related to interacting with the Oracle contract.
 */
export default class OracleWrapper {
  public abi: ContractAbi = Oracle.abi;

  private static PATH: string = 'https://oracle.ripio.com/rate/'; 
  protected contract: Promise<OracleContract>;

  /**
   * Instantiate OracleWrapper
   * @param contract
   */
  public constructor(contract: Promise<OracleContract>) {
    this.contract = contract;
  }

  public async getOracleData(currency: string): Promise<string> {
    
    const currencyHex: string = ethUtil.bufferToHex(new Buffer(ethUtil.setLengthRight(currency, 32)));
    return axios.get(OracleWrapper.PATH).then(response => {
        let data = '0x'; 
        response.data.forEach(function(item: any) {
          if (item.currency === currencyHex) {
            data = item.data;
          }
        })
        return data;
    })

  }

  /**
   * Returns the contract address
   */
  public address = async (): Promise<string> => {
    return (await this.contract).address;
  };

}