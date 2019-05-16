import { TxData, TxDataPayable } from '@0x/web3-wrapper';
import { ContractEventArg, DecodedLogArgs, LogWithDecodedArgs, BlockParam } from 'ethereum-types';
import {
  LoanManagerContract,
  InstallmentsModelContract,
  DebtEngineContract,
  OracleAdapterContract,
  IERC20Contract,
  DebtEngineEventArgs,
  IERC173EventArgs,
  InstallmentsModelEventArgs,
  ERC721BaseEventArgs,
  LoanManagerEvents,
  ModelEvents,
  OracleEvents,
  DebtEngineEvents,
  IERC173Events,
  ERC721BaseEvents,
  InstallmentsModelEvents,
  LoanManagerEventArgs,
  ModelEventArgs,
  OracleEventArgs
} from '@jpgonzalezra/abi-wrappers';
import { RcnTokenEventArgs, RcnTokenEvents } from './contract_wrappers/tokens/rcn_token_wrapper'

/**
 * @param txData Data to override default values on tx, i.e. 'from', 'gasPrice'
 * @param safetyFactor Factor to use for gas limit estimation
 */
export interface TxParams {
  txData?: Partial<TxData>;
  safetyFactor?: number;
}

export interface TxPayableParams {
  txData?: Partial<TxDataPayable>;
  safetyFactor?: number;
}

export enum NetworkId {
  Mainnet = 1,
  Ropsten = 3,
  Local = 15,
}

export enum DiasporeContracts {
  LoanManagerContract = "diaspore/loan-manager:1.0.0",
  InstallmentsModelContract = "diaspore/installments-model:1.0.0",
  DebtEngineContract = "diaspore/debt-engine:1.0.0",
  IERC20Contract = "rcn/token:1.0.0",
  OracleContract = "ripio/oracle:1.0.0"
}

export interface DecodedLogEvent<ArgsType extends DecodedLogArgs> {
  isRemoved: boolean;
  log: LogWithDecodedArgs<ArgsType>;
}

export type EventCallback<ArgsType extends DecodedLogArgs> = (
  err: null | Error,
  log?: DecodedLogEvent<ArgsType>,
) => void;

export interface IndexedFilterValues {
  [index: string]: ContractEventArg;
}

export interface BlockRange {
  fromBlock: BlockParam;
  toBlock: BlockParam;
}

export type ContractEventArgs =
  | DebtEngineEventArgs
  | IERC173EventArgs
  | InstallmentsModelEventArgs
  | ERC721BaseEventArgs
  | LoanManagerEventArgs
  | ModelEventArgs
  | OracleEventArgs
  | RcnTokenEventArgs

export type ContractEvents = 
  | DebtEngineEvents
  | IERC173Events
  | ERC721BaseEvents
  | InstallmentsModelEvents
  | LoanManagerEvents
  | ModelEvents
  | OracleEvents
  | RcnTokenEvents
  

/**
 * @param eventName           The contract event you would like to subscribe to.
 * @param blockRange          Block range to get logs from.
 * @param indexFilterValues   An object where the keys are indexed args returned by the event and
 *                            the value is the value you are interested in.
 */
export interface GetLogsAsyncParams {
  eventName: ContractEvents;
  blockRange: BlockRange;
  indexFilterValues: IndexedFilterValues;
}

/**
 * @param contractAddress     The hex encoded address where the contract is deployed.
 * @param eventName           The contract event you would like to subscribe to.
 * @param indexFilterValues   An object where the keys are indexed args returned by the event and
 *                            the value is the value you are interested in.
 * @param callback            Callback that gets called when a log is added/removed
 * @param isVerbose           Enable verbose subscription warnings (e.g recoverable network issues encountered)
 */
export interface SubscribeAsyncParams {
  eventName: ContractEvents;
  indexFilterValues: IndexedFilterValues;
  callback: EventCallback<ContractEventArg>;
  isVerbose?: boolean;
}

export interface GetLogs {
  (params: GetLogsAsyncParams): Promise<LogWithDecodedArgs<ContractEventArgs>[]>;
}

export interface Subscribe {
  (params: SubscribeAsyncParams): Promise<string>;
}

export type ERC20Contract = IERC20Contract;
