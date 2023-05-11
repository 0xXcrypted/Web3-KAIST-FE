import Image from "next/image";
import { useEffect, useState } from "react";
import { Web3Button } from "@web3modal/react";
import { useAccount, useWalletClient, useBalance } from "wagmi";
import { readContract, writeContract } from "@wagmi/core";
import { formatEther, parseEther } from "viem";
import { mainnet, sepolia } from "wagmi/chains";
import { useWeb3Modal } from "@web3modal/react";
import styled from "styled-components";
import { SampleTokenAbi, SampleTokenAddress } from "@/lib/SampleToken";
import { WrappedEtherAbi, WrappedEtherAddress } from "@/lib/WrappedEther";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #000000;
`;

const Header = styled.div`
  display: flex;
  width: 100%;
  background-color: #000000;
  flex-direction: row;
  justifycontent: space-between;
  align-items: center;
  border-bottom: 1px solid #ffffff;
  padding: 1rem;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justifycontent: center;
  align-items: flex-start;
`;

const LinkButton = styled.a`
  text-decoration: underline;
`;

const Title = styled.h2`
  color: #c10000;
`;
export default function Home() {
  const { setDefaultChain } = useWeb3Modal();
  setDefaultChain(sepolia);

  const { isConnected, address } = useAccount();

  const { data: walletClient } = useWalletClient();

  const [ethBalance, setEthBalance] = useState<string>("0");
  const [sampleTokenBalance, setSampleTokenBalance] = useState<string>("0");
  const [wrappedEthBalance, setWrappedEthBalance] = useState<string>("0");
  const { data: ethBalanceData } = useBalance({
    address,
  });

  const fetchEthBalance = async () => {
    if (!isConnected) return;
    const res = ethBalanceData?.formatted;
    // @ts-ignore
    setEthBalance(res);
  };

  const fetchSampleTokenBalance = async () => {
    if (!isConnected) return;
    const res = await readContract({
      address: SampleTokenAddress,
      abi: SampleTokenAbi,
      functionName: "balanceOf",
      args: [address],
    });
    // @ts-ignore
    setSampleTokenBalance(formatEther(res).toString());
  };

  const fetchWrappedEtherBalance = async () => {
    if (!isConnected) return;
    const res = await readContract({
      address: WrappedEtherAddress,
      abi: WrappedEtherAbi,
      functionName: "balanceOf",
      args: [address],
    });
    // @ts-ignore
    setWrappedEthBalance(formatEther(res).toString());
  };

  const fetchAllToken = async () => {
    if (!isConnected) return;
    fetchEthBalance();
    fetchSampleTokenBalance();
    fetchWrappedEtherBalance();
  };

  const setterFunctionHandler = async () => {
    const res = await writeContract({
      address: SampleTokenAddress,
      abi: SampleTokenAbi,
      functionName: "mint",
      args: [address, parseEther("1")],
    });
    alert(`transaction sent with tx hash: ${res.hash}`);
    fetchSampleTokenBalance();
  };

  const unwrapFunctionHandler = async () => {
    const res = await writeContract({
      address: WrappedEtherAddress,
      abi: WrappedEtherAbi,
      functionName: "withdraw",
      args: [parseEther("0.1").toString()],
    });
    alert(`transaction sent with tx hash: ${res.hash}`);
    fetchEthBalance();
    fetchWrappedEtherBalance();
  };

  const payableFunctionHandler = async () => {
    const res = await writeContract({
      address: WrappedEtherAddress,
      abi: WrappedEtherAbi,
      functionName: "deposit",
      args: [],
      // @ts-ignore
      value: parseEther("0.1").toString(),
    });
    alert(`transaction sent with tx hash: ${res.hash}`);
    fetchSampleTokenBalance();
  };

  useEffect(() => {
    if (isConnected) {
      fetchEthBalance();
      fetchSampleTokenBalance();
      fetchWrappedEtherBalance();
    }
  }, [isConnected, address]);

  return (
    <>
      <PageContainer>
        <Header>
          <Web3Button />
        </Header>

        <Content>
          <h2>
            Using
            <LinkButton href={`https://wagmi.sh/`}>WAGMI react</LinkButton>
            with
            <LinkButton href={`https://nextjs.org/`}>Next.js</LinkButton>
          </h2>
          <h2>
            Check Contract Execution Example on{" "}
            <LinkButton
              href={`https://sepolia.etherscan.io/address/0x688160C614c63e49C4cd59246e546b3bE03C43fd`}
            >
              Etherscan
            </LinkButton>
          </h2>

          <h4>Account: {address}</h4>
          <h4>SampleTokenAddress: {SampleTokenAddress}</h4>
          <Title>Getter Function(View Function)</Title>
          <h4>Eth Balance: {ethBalance}</h4>
          <h4>Sample Token Balance: {sampleTokenBalance} </h4>
          <h4>Wrapped Eth Balance: {wrappedEthBalance} </h4>
          <button onClick={fetchAllToken}> Fetch All Token</button>

          <Title>Setter Function(State Changing Function)</Title>
          <button onClick={setterFunctionHandler}>Mint 1 Sample Token</button>
          <button onClick={fetchSampleTokenBalance}>
            Fetch Sample Token Balance
          </button>
          <button onClick={unwrapFunctionHandler}>Unwrap 0.1 Eth</button>

          <Title>Payable Function</Title>
          <button onClick={payableFunctionHandler}>Wrap 0.1 Eth</button>
        </Content>
      </PageContainer>
    </>
  );
}
