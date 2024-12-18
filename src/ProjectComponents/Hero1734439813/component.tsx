
import React from 'react';
import * as ethers from 'ethers';

const StakingHero: React.FC = () => {
  const [provider, setProvider] = React.useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = React.useState<ethers.Signer | null>(null);
  const [contract, setContract] = React.useState<ethers.Contract | null>(null);
  const [stakingAmount, setStakingAmount] = React.useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = React.useState<string>('');
  const [stakedBalance, setStakedBalance] = React.useState<string>('0');
  const [totalStaked, setTotalStaked] = React.useState<string>('0');
  const [earnedRewards, setEarnedRewards] = React.useState<string>('0');
  const [error, setError] = React.useState<string | null>(null);

  const contractAddress = '0x66efDFc43AbdD960bea175dfB3C1198F6C807F40';
  const chainId = 17000; // Holesky testnet

  const contractABI = [
    "function stake(uint256 amount) external",
    "function withdraw(uint256 amount) public",
    "function claimRewards() public",
    "function getStakedBalance(address account) external view returns (uint256)",
    "function getTotalStaked() external view returns (uint256)",
    "function earned(address account) public view returns (uint256)"
  ];

  React.useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        const web3Signer = web3Provider.getSigner();
        setSigner(web3Signer);
        const stakingContract = new ethers.Contract(contractAddress, contractABI, web3Signer);
        setContract(stakingContract);
      }
    };
    init();
  }, []);

  const connectWallet = async () => {
    if (provider) {
      try {
        await provider.send("eth_requestAccounts", []);
        const network = await provider.getNetwork();
        if (network.chainId !== chainId) {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ethers.utils.hexValue(chainId) }],
          });
        }
      } catch (err) {
        console.error("Failed to connect wallet:", err);
        setError("Failed to connect wallet. Please try again.");
      }
    }
  };

  const updateBalances = async () => {
    if (contract && signer) {
      try {
        const address = await signer.getAddress();
        const stakedBal = await contract.getStakedBalance(address);
        setStakedBalance(ethers.utils.formatEther(stakedBal));
        const totalStakedAmount = await contract.getTotalStaked();
        setTotalStaked(ethers.utils.formatEther(totalStakedAmount));
        const earned = await contract.earned(address);
        setEarnedRewards(ethers.utils.formatEther(earned));
      } catch (err) {
        console.error("Failed to update balances:", err);
        setError("Failed to update balances. Please try again.");
      }
    }
  };

  const handleStake = async () => {
    if (contract && stakingAmount) {
      try {
        await connectWallet();
        const tx = await contract.stake(ethers.utils.parseEther(stakingAmount));
        await tx.wait();
        await updateBalances();
        setStakingAmount('');
      } catch (err) {
        console.error("Staking failed:", err);
        setError("Staking failed. Please try again.");
      }
    }
  };

  const handleWithdraw = async () => {
    if (contract && withdrawAmount) {
      try {
        await connectWallet();
        const tx = await contract.withdraw(ethers.utils.parseEther(withdrawAmount));
        await tx.wait();
        await updateBalances();
        setWithdrawAmount('');
      } catch (err) {
        console.error("Withdrawal failed:", err);
        setError("Withdrawal failed. Please try again.");
      }
    }
  };

  const handleClaimRewards = async () => {
    if (contract) {
      try {
        await connectWallet();
        const tx = await contract.claimRewards();
        await tx.wait();
        await updateBalances();
      } catch (err) {
        console.error("Claiming rewards failed:", err);
        setError("Claiming rewards failed. Please try again.");
      }
    }
  };

  React.useEffect(() => {
    if (contract && signer) {
      updateBalances();
    }
  }, [contract, signer]);

  return (
    <div className="bg-black py-16 text-white w-full min-h-screen">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8">Staking Dashboard</h1>
        
        <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Staking Info</h2>
          <p className="mb-2">Staked Balance: {stakedBalance} tokens</p>
          <p className="mb-2">Total Staked: {totalStaked} tokens</p>
          <p className="mb-4">Earned Rewards: {earnedRewards} tokens</p>
          
          <div className="mb-4">
            <input
              type="number"
              value={stakingAmount}
              onChange={(e) => setStakingAmount(e.target.value)}
              placeholder="Amount to stake"
              className="w-full p-2 rounded bg-gray-700 text-white mb-2"
            />
            <button onClick={handleStake} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Stake
            </button>
          </div>
          
          <div className="mb-4">
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount to withdraw"
              className="w-full p-2 rounded bg-gray-700 text-white mb-2"
            />
            <button onClick={handleWithdraw} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Withdraw
            </button>
          </div>
          
          <button onClick={handleClaimRewards} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Claim Rewards
          </button>
        </div>
        
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mt-4">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export { StakingHero as component };
