import http from '@/utils/backend/http';
import { DEFAULT_CHAIN_ID } from '@/constants/chains.constant'

const URL = process.env.NEXT_PUBLIC_API_URL;
const isTestnet = Boolean(process.env.NEXT_PUBLIC_IS_TESTNET || false)

const fetchNetworks = async () => {
  const res = await http.get(
    `${URL}/network`, {
    params: {
      isMainnet: !isTestnet
    }
  });

  return res;
};

const fetchAssets = async (params: any) => {
  const chainId = params?.chainId || DEFAULT_CHAIN_ID
  const res = await http.get(
    `${URL}/asset`, {
    params: {
      category: 'supply',
      isMainnet: !isTestnet,
      chainId
    }
  });

  return res;
};

const fetchUserSupply = async (params: any) => {
  const chainId = params?.chainId || DEFAULT_CHAIN_ID
  const address = params.address
  const res = await http.get(`${URL}/user/${address}/${chainId}/supply`);

  return res;
};

const fetchPools = async (params: any) => {
  const chainId = params?.chainId || DEFAULT_CHAIN_ID
  const res = await http.get(`${URL}/pool/all/${chainId}`);

  return res || [];
};

const fetchPrice = async (params: any) => {
  const chainId = params?.chainId || DEFAULT_CHAIN_ID
  const asset = params?.asset || 'ETH'
  const res = await http.get(`${URL}/price/${chainId}/${asset}`);

  return res || [];
};

const fetchContracts = async (params: any) => {
  const res = await http.get(`${URL}/contract`, {
    params
  });

  return res || [];
};

const getSetting = async (key: any) => {
  let res: any = await http.get(`${URL}/setting?key=${key}`);
  if (res && res.length > 0) {
    return res[0]
  }
  return {};
};

const service = {
  fetchNetworks,
  fetchAssets,
  fetchUserSupply,
  fetchPools,
  fetchPrice,
  fetchContracts,
  getSetting
};

export default service;
