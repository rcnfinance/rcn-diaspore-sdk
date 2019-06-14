import { BigNumber } from '@0x/utils';
import InstallmentsModelWrapper from '../web3/installments_model_wrapper';
import { InstallmentsModelMarmoContract, DebtEngineMarmoContract, Response } from '@jpgonzalezra/marmo-abi-wrappers';
import { Wallet, Provider } from 'marmojs';
import DebtEngineWrapper from '../web3/debt_engine_wrapper';


/**
 * This class includes the functionality related to interacting with the LoanManager contract.
 */
export default class InstallmentsModelMarmoWrapper {


  protected wrapper: DebtEngineWrapper;
  protected contract: DebtEngineMarmoContract;


  /**
   * Instantiate InstallmenstModelWrapper
   * @param web3Wrapper Web3Wrapper instance to use
   * @param contract
   */
  public constructor(debtEngineWrapper: DebtEngineWrapper, address: Promise<string>, wallet: Wallet, provider: Provider) {
    this.contract = new DebtEngineMarmoContract(address, wallet, provider);
    this.wrapper = debtEngineWrapper;
  }

  /**
   *  Send Transactions
   */
  public withdraw = async (id: string, to: string) => {
    const response: Response = await this.contract.withdraw(id, to)
    return response.txHash
  }

  public withdrawBatch = async (ids: string[], to: string) => {
    const response: Response = await this.contract.withdrawBatch(ids, to)
    return response.txHash
  }

  public withdrawPartial = async (id: string, to: string, amount: BigNumber) => {
    const response: Response = await this.contract.withdrawPartial(id, to, amount)
    return response.txHash
  }

}