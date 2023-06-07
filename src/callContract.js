import { ethers } from "ethers";
const { JsonRpcProvider } = ethers.providers;
const { Contract } = ethers;
const { formatEther } = ethers.utils;
const provider = new JsonRpcProvider("https://rpc.ankr.com/eth");

const controllerFactory = new Contract(
  "0xC9332fdCB1C491Dcc683bAe86Fe3cb70360738BC",
  ["function total_debt() external view returns (uint256)"],
  provider
);

const aggregatorStablePrice = new Contract(
  "0xe5Afcf332a5457E8FafCD668BcE3dF953762Dfe7",
  ["function price() external view returns (uint256)"],
  provider
);

const pegKeepers = [
  "0xaA346781dDD7009caa644A4980f044C50cD2ae22",
  "0xE7cd2b4EB1d98CD6a4A48B6071D46401Ac7DC5C8",
  "0x6B765d07cf966c745B340AdCa67749fE75B5c345",
  "0x1ef89Ed0eDd93D1EC09E4c07373f69C49f4dcCae",
].map((address) => {
  return new Contract(
    address,
    ["function debt() external view returns (uint256)"],
    provider
  );
});

export async function callTotalDebt() {
  const res = await controllerFactory.total_debt();
  return Number(formatEther(res));
}

export async function callStablePrice() {
  const res = await aggregatorStablePrice.price();
  return Number(formatEther(res));
}

export async function callPegKeepersDebt() {
  const res = await Promise.all(
    pegKeepers.map((pk) => {
      return pk.debt();
    })
  );
  return res.map((r) => Number(formatEther(r))).reduce((a, b) => a + b);
}
