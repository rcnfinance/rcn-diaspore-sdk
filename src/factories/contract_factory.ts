import { TxData, Provider } from 'ethereum-types';
import {
  LoanManagerContract,
  DebtEngineContract,
  NanoLoanModelContract,
  InstallmentsModelContract,
  IERC20Contract
} from '@jpgonzalezra/abi-wrappers';
import {
  IERC20,
  LoanManager,
  DebtEngine,
  NanoLoanModel,
  InstallmentsModel
} from '@jpgonzalezra/diaspore-contract-artifacts';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { DiasporeContracts, NetworkId } from '../types';
import assert from '../utils/assert';
import getDefaultContractAddresses from '../utils/addresses';

export default class ContractFactory {
  private web3Wrapper: Web3Wrapper;

  private provider: Provider;
  private rcnToken: string;
  private contractDefaults: Partial<TxData>;

  public constructor(web3Wrapper: Web3Wrapper, rcnToken: string) {
    this.web3Wrapper = web3Wrapper;
    this.provider = web3Wrapper.getProvider() as Provider;
    this.contractDefaults = this.web3Wrapper.getContractDefaults();
    this.rcnToken = rcnToken;
  }

  public async getRcnTokenContract(): Promise<IERC20Contract> {
    return new IERC20Contract(
      IERC20.abi,
      this.rcnToken,
      this.provider,
      this.contractDefaults,
    );
  }

  public async getLoanManagerContract(address: string): Promise<LoanManagerContract> {
    assert.isETHAddressHex('address', address);
    return new LoanManagerContract(
      LoanManager.abi,
      address,
      this.provider,
      this.contractDefaults,
    );
  }

  public async getDebtEngineContract(address: string): Promise<DebtEngineContract> {
    assert.isETHAddressHex('address', address);
    return new DebtEngineContract(
      DebtEngine.abi,
      address,
      this.provider,
      this.contractDefaults,
    );
  }

  public async getNanoLoanModelContract(address: string): Promise<NanoLoanModelContract> {
    assert.isETHAddressHex('address', address);
    return new NanoLoanModelContract(
      NanoLoanModel.abi,
      address,
      this.provider,
      this.contractDefaults,
    );
  }
  public async getInstallmentsModelContract(address: string): Promise<InstallmentsModelContract> {
    assert.isETHAddressHex('address', address);
    return new InstallmentsModelContract(
      InstallmentsModel.abi,
      address,
      this.provider,
      this.contractDefaults,
    );
  }
  
}
