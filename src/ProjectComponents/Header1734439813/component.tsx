
import React from 'react';
import { ethers } from 'ethers';

const Hero: React.FC = () => {
  const [account, setAccount] = React.useState<string | null>(null);
  const [currentSupply, setCurrentSupply] = React.useState<string>('0');
  const [maxSupply, setMaxSupply] = React.useState<string>('0');
  const [mintAmount, setMintAmount] = React.useState<string>('');
  const [isOwner, setIsOwner] = React.useState<boolean>(false);
  const [status, setStatus] = React.useState<string>('');

  const contractAddress = '0x752beA76271eB8484f88cD7550a17A573C409114';
  const chainId = 17000; // Holesky testnet

  const contractABI = [
    "function getCurrentSupply() external view returns (uint256)",
    "function getMaxSupply() external view returns (uint256)",
    "function mint(address to, uint256 amount) external",
    "function owner() public view returns (address)"
  ];

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        checkOwner(provider, address);
        await switchNetwork(provider);
        updateSupply(provider);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        setStatus('Failed to connect wallet. Please try again.');
      }
    } else {
      setStatus('Please install MetaMask to use this dApp.');
    }
  };

  const switchNetwork = async (provider: ethers.providers.Web3Provider) => {
    const network = await provider.getNetwork();
    if (network.chainId !== chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexValue(chainId) }],
        });
      } catch (error) {
        console.error('Failed to switch network:', error);
        setStatus('Failed to switch to the correct network. Please switch to Holesky testnet manually.');
      }
    }
  };

  const checkOwner = async (provider: ethers.providers.Web3Provider, address: string) => {
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const ownerAddress = await contract.owner();
    setIsOwner(ownerAddress.toLowerCase() === address.toLowerCase());
  };

  const updateSupply = async (provider: ethers.providers.Web3Provider) => {
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    try {
      const currentSupplyBN = await contract.getCurrentSupply();
      const maxSupplyBN = await contract.getMaxSupply();
      setCurrentSupply(ethers.utils.formatEther(currentSupplyBN));
      setMaxSupply(ethers.utils.formatEther(maxSupplyBN));
    } catch (error) {
      console.error('Error fetching supply:', error);
      setStatus('Error fetching supply information. Please try again.');
    }
  };

  const mintTokens = async () => {
    if (!account) {
      setStatus('Please connect your wallet first.');
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await switchNetwork(provider);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    try {
      const tx = await contract.mint(account, ethers.utils.parseEther(mintAmount));
      setStatus('Minting transaction sent. Waiting for confirmation...');
      await tx.wait();
      setStatus('Tokens minted successfully!');
      updateSupply(provider);
      setMintAmount('');
    } catch (error) {
      console.error('Error minting tokens:', error);
      setStatus('Error minting tokens. Please try again.');
    }
  };

  React.useEffect(() => {
    connectWallet();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-5">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Token Minting dApp</h1>
        
        <div className="mb-6">
          <p className="text-lg mb-2">
            {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Wallet not connected'}
          </p>
          {!account && (
            <button
              onClick={connectWallet}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Connect Wallet
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Current Supply</h2>
            <p className="text-2xl">{currentSupply} MTK</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Max Supply</h2>
            <p className="text-2xl">{maxSupply} MTK</p>
          </div>
        </div>

        {isOwner && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Mint Tokens</h2>
            <div className="flex items-center">
              <input
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                placeholder="Amount to mint"
                className="border rounded px-3 py-2 mr-2 flex-grow"
              />
              <button
                onClick={mintTokens}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Mint
              </button>
            </div>
          </div>
        )}

        {status && (
          <div className={`mt-4 p-3 rounded ${status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

export { Hero as component };
