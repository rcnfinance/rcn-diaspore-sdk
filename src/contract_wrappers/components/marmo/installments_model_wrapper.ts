import { BigNumber } from '@0x/utils';
import InstallmentsModelWrapper from '../web3/installments_model_wrapper';
import { InstallmentsModelMarmoContract, Response } from '@jpgonzalezra/marmo-abi-wrappers';
import { Wallet, Provider } from 'marmojs';


/**
 * This class includes the functionality related to interacting with the LoanManager contract.
 */
export default class InstallmentsModelMarmoWrapper {


  protected wrapper: InstallmentsModelWrapper;
  protected contract: InstallmentsModelMarmoContract;

  /**
   * Instantiate InstallmenstModelWrapper
   * @param web3Wrapper Web3Wrapper instance to use
   * @param contract
   */
  public constructor(installmentsModelWrapper: InstallmentsModelWrapper, address: Promise<string>, wallet: any, provider: Provider) {
    this.contract = new InstallmentsModelMarmoContract(address, wallet, provider);
    this.wrapper = installmentsModelWrapper;
  }

  /**
   * Calls
   */
  public encodeData = async (cuota: BigNumber, interestRate: BigNumber, installments: BigNumber, duration: BigNumber, timeUnit: number | BigNumber) => {
    return (await this.wrapper).encodeData(cuota, interestRate, installments, duration, timeUnit);
  };

  public create = async (id: string, data: string) => {
    return (await this.wrapper).create(id, data)
  }

  public isValid = async (data: string) => {
    return (await this.wrapper).isValid(data);
  } 
  /**
   *  Send Transactions
   */
  public addDebt = async (id: string, amount: BigNumber) => {
    const response: Response = await this.contract.addDebt(id, amount)
    return response.txHash
  }

  public addPaid = async (id: string, amount: BigNumber) => {
    const response: Response = await this.contract.addPaid(id, amount)
    return response.txHash
  }

  public fixClock = async (id: string, amount: BigNumber) => {
    const response: Response = await this.contract.fixClock(id, amount)
    return response.txHash
  }

  public run = async (id: string) => {
    this.contract.run(id)
  }

}