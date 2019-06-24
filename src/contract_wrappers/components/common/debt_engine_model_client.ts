
import axios from 'axios';
import { BigNumber } from '@0x/utils';

export default class DebtEngineClient {

  private static PATH: string = 'https://diaspore-ropsten-rnode.rcn.loans/';

  public async getAmountToPay(id: string): Promise<BigNumber> {
    return axios.get(DebtEngineClient.PATH + id).then(response => {
      console.log(response.data)
      return response.data.next_obligation;
    })
  }


}