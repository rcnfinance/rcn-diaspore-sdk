
import axios from 'axios';
import { BigNumber } from '@0x/utils';

export default class DebtEngineClient {

  private static PATH: string = 'https://diaspore-ropsten-rnode.rcn.loans/v4/model_debt_info/'; // TODO: DESHARCODING

  public async getAmountNextObligation(id: string): Promise<BigNumber> {
    return axios.get(DebtEngineClient.PATH + id).then(response => {
      return new BigNumber(response.data.next_obligation * 10e17);
    })
  }

  public async getAmountCurrentObligation(id: string): Promise<BigNumber> {
    return axios.get(DebtEngineClient.PATH + id).then(response => {
      return new BigNumber(response.data.current_obligation * 10e17);
    })
  }


}