export type ContractAddress = string;

interface FlareSystemsManagerDefinition {
  name: "FlareSystemsManager";
  address: ContractAddress;
}

export type ContractDefinitions =
  | FlareSystemsManagerDefinition;

export type ContractDefinitionsNames =
  | FlareSystemsManagerDefinition["name"];

export interface NetworkContractAddresses {
  FlareSystemsManager: FlareSystemsManagerDefinition;
}
