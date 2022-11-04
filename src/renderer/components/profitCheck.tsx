import keys from './keys.json';

let RESERVOIR_KEY = keys.RESERVOIR_KEY;
let ALCHEMY_KEY = keys.ALCHEMY_KEY;
let ETHERSCAN_KEY = keys.ETHERSCAN_KEY

let currentlyBeingUsed = false;
let alreadyWarned = false;

// function gets called when command is ran
export async function check_profit(contract, addresses) {
    return new Promise(async resolve => {
        alreadyWarned = false;

        // checks if contract provided is valid address
        if (!/^0x[a-fA-F0-9]{40}$/.test(contract)) {
          console.log('invalid address provided');
        } else {
            let options = {
                method: 'POST',
                headers: {accept: 'application/json', 'content-type': 'application/json'},
                body: JSON.stringify({
                    id: 1,
                    jsonrpc: '2.0',
                    params: [contract],
                    method: 'eth_getCode'
                })
            };

            fetch(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, options)
            .then(response => response.json())
            .then(async value => {
                // checks if address is user wallet or contract (user wallets have no code)
                if (value == "0x") {
                  console.log('address provided not a contract')
                } else {
                    // check to see if its currently calculating from somewhere else. This is to prevent rate limiting
                    if (currentlyBeingUsed) {
                      console.log("already in use");
                    } else {
                        currentlyBeingUsed = true;
                    
                        // defines profit table to track all the stats
                        let profitTable = {
                          totalMoneyIn: 0,
                          mintCost: 0,
                          mintGasFees: 0,
                          buyInCost: 0,
                          buyInGasFee: 0,
                          totalAmountSold: 0,
                          totalAmountMinted: 0,
                          totalAmountBoughtSecondary: 0,
                          currentlyHeld: 0,
                          currentFloor: 0,
                          unrealizedProfit: 0,
                          realizedProfit: 0,
                        };

                        console.log("getting wallets");

                        // checks if no addresses
                        if (addresses.length == 0) {
                          console.log('no wallets found');
                          currentlyBeingUsed = false;
                        } else {
                            let totalAddressArray = addresses;
                            let contractAddress = contract;
                            console.log(`got ${totalAddressArray.length} wallets`);
                            // loopes for each address user has tracked
                            for (let i = 0; i < totalAddressArray.length; i++) {
                                setTimeout(async () => {
                                  let currentAddress = totalAddressArray[i].toLowerCase()
                                  let resultNftsOut = await getNftsOut(profitTable, currentAddress, contractAddress);
                                  let resultNftsIn = await getNftsIn(resultNftsOut, currentAddress, contractAddress);
                                  if (i == totalAddressArray.length - 1) {
                                    let resultFinal = await getFloor(resultNftsIn, contractAddress);
                                    currentlyBeingUsed = false;
                                    // final reply
                                    console.log(resultFinal);
                                    resolve(resultFinal);
                                  }
                                }, 1000 * (i + 1) );
                            }
                        }
                    }
                }
            }).catch(async err => {
              console.log(err);
            });
        }
    });
}

// get nft out transfers
function getNftsOut(profitTable, userAddress, contractAddress) {
  return new Promise(async resolve => {
    console.log(`getting nfts out for ${userAddress}`);
    // checks nfts that came out of wallet
    let options = {
        method: 'POST',
        headers: {accept: 'application/json', 'content-type': 'application/json'},
        body: JSON.stringify({
            id: 1,
            jsonrpc: '2.0',
            method: 'alchemy_getAssetTransfers',
            params: [
                {
                    fromBlock: "0x0",
                    fromAddress: `${userAddress}`,
                    contractAddresses: [`${contractAddress}`],
                    excludeZeroValue: false,
                    category: ["erc721", "erc1155"],
                }
            ]
        })
    };
      
    fetch(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, options)
    .then(response => response.json())
    .then(response => {
        let value:any = response.result;
        let checkedTxs:any = [];
        console.log('got alchemy transfers out');
        // checks if there are any transfers out
        if (value.transfers.length == 0) {
          console.log("none tracked out");
          resolve(profitTable);
        }
        // for each nft transfered in
        for (let i = 0; i < value.transfers.length; i++) {
          // calls etherscan internal tx api for each transaction
          setTimeout(() => { fetch(`https://api.etherscan.io/api?module=account&action=txlistinternal&txhash=${value.transfers[i].hash}&apikey=${ETHERSCAN_KEY}`)
          .then(response => response.json())
          .then(async response => {
            console.log('etherscan transfers out: ', response.result.length, ', transfer: ', i);
            // rate limit check
            if (response.result == 'Max rate limit reached' && alreadyWarned == false) {
              console.log('rate limited');
              alreadyWarned = true;
            }
            // checks to see if tx was already tracked (this is to prevent double tracking from multiple sales included in 1 tx like a gem sweep)
            if (checkedTxs.includes(value.transfers[i].hash) == false) {
              checkedTxs.push(value.transfers[i].hash);
              // loops for each internal tx
              for (let j = 0; j < response.result.length; j++) {
                // checks each internal tx to make sure its the one with the funds going to user wallet
                if (response.result[j].to == userAddress) {
                    let soldInEth = response.result[j].value / 1000000000000000000;
                    profitTable.totalMoneyIn += soldInEth;
                    profitTable.totalAmountSold += 1;
                }
              }
            }
            // checks to make sure all transfers in are tracked before resolving
            if (i == value.transfers.length-1) {
              console.log(`done tracking out for ${userAddress}`);
              resolve(profitTable);
            }
          }).catch(async err => {
            console.error(err);
            currentlyBeingUsed = false;
          }); }, 250 * (i + 1) );
        }
    }).catch(async err => {
      console.error(err);
      currentlyBeingUsed = false;
    });
  });
}

// get nft in transfers
function getNftsIn(profitTable, userAddress, contractAddress) {
  return new Promise(async resolve => {
    console.log(`getting nfts in for ${userAddress}`);
    // checks nfts that came into wallet
    let options = {
        method: 'POST',
        headers: {accept: 'application/json', 'content-type': 'application/json'},
        body: JSON.stringify({
            id: 1,
            jsonrpc: '2.0',
            method: 'alchemy_getAssetTransfers',
            params: [
                {
                    fromBlock: "0x0",
                    contractAddresses: [`${contractAddress}`],
                    toAddress: `${userAddress}`,
                    excludeZeroValue: false,
                    category: ["erc721", "erc1155"],
                }
            ]
        })
    };
      
    fetch(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, options)
    .then(response => response.json())
    .then(response => {
      let value:any = response.result;
      console.log('got alchemy transfers in');
      let checkedTxs:any = [];
      // checks if there are any nft transfers in
      if (value.transfers.length == 0) {
        console.log("no tracking in");
        resolve(profitTable);
      }
      // runs for each nfts transfer in
      for (let i = 0; i < value.transfers.length; i++) {
        let blocknum = parseInt(value.transfers[i].blockNum, 16)
        // gets specific transaction details with etherscan api
        setTimeout(() => { fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${userAddress}&startblock=${blocknum}&endblock=${blocknum}&page=1&offset=10&sort=desc&apikey=${ETHERSCAN_KEY}`)
        .then(response => response.json())
        .then(async response => {
          console.log('etherscan transfers in: ', response.result.length, ', transfer: ', i);
          // rate limit check
          if (response.result == 'Max rate limit reached' && alreadyWarned == false) {
            console.log('rate limited');
            alreadyWarned = true;
          }
          // runs for each tx
          for (let j = 0; j < response.result.length; j++) {
            // checks each tx to make sure it matches nft transfer tx to get around etherscan weird api
            if (response.result[j].hash == value.transfers[i].hash) {
              // checks if minted or somewhere else
              if (value.transfers[i].from == "0x0000000000000000000000000000000000000000") {
                // if minted
                if (checkedTxs.includes(response.result[j].hash) == false) {
                  checkedTxs.push(response.result[j].hash);
                  let mintCost = response.result[j].value.toString() / 1000000000000000000;
                  let mintGasCost = response.result[j].gasPrice * response.result[j].gasUsed / 1000000000000000000;
                  profitTable.mintGasFees += mintGasCost;
                  profitTable.mintCost += mintCost;
                }
                profitTable.totalAmountMinted += 1;
              } else {
                // if somewhere else
                if (checkedTxs.includes(response.result[j].hash) == false) {
                  checkedTxs.push(response.result[j].hash);
                  let secondaryCost = response.result[j].value / 1000000000000000000;
                  let buyinGasCost = response.result[j].gasPrice * response.result[j].gasUsed / 1000000000000000000;
                  profitTable.buyInGasFee += buyinGasCost;
                  profitTable.buyInCost += secondaryCost;
                }
                profitTable.totalAmountBoughtSecondary += 1;
              };
            } else {
              console.log("no match...");
            }
          }
          // checks to make sure all transfers in are tracked
          if (i == value.transfers.length-1) {
            console.log(`done tracking in for ${userAddress}`);
            // gets current holding for address
            let options:any = {
                method: 'POST',
                body: JSON.stringify({
                    "jsonrpc": "2.0",
                    "method": "alchemy_getTokenBalances",
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "params": [`${userAddress}`,[`${contractAddress}`,]],
                    "id": 42
                }),
                redirect: 'follow'
            };
            fetch(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, options)
            .then(response => response.json())
            .then(response => {
              let getTokenBalancesValue = response.result;
              let amountOwned = parseInt(getTokenBalancesValue.tokenBalances[0].tokenBalance, 16)
              profitTable.currentlyHeld += amountOwned;
              console.log(`done getting held for ${userAddress}`);
              resolve(profitTable);
            }).catch(async err => {
              console.error(err);
              currentlyBeingUsed = false;
            });
          }
        }).catch(async err => {
          console.error(err);
          currentlyBeingUsed = false;
        }); }, 250 * (i + 1) );
      }
    }).catch(async err => {
      console.error(err);
      currentlyBeingUsed = false;
    });
  });
}

// gets collection floor and other details, also creates final embed
function getFloor(profitTable, contractAddress) {
  return new Promise(async resolve => {
    console.log(`Getting collection details for ${contractAddress}`);
    let options = {method: 'GET', headers: {accept: '*/*', 'x-api-key': `${RESERVOIR_KEY}`}};
    // gets collection details
    fetch(`https://api.reservoir.tools/collections/v5?id=${contractAddress}&includeTopBid=false&sortBy=allTimeVolume&limit=20`, options)
      .then(response => response.json())
      .then(async response => {
        // final calculations
        profitTable.currentFloor = response.collections[0].floorAsk.price.amount.decimal
        profitTable.realizedProfit = profitTable.totalMoneyIn - (profitTable.buyInCost + profitTable.buyInGasFee + profitTable.mintCost + profitTable.mintGasFees);
        if (profitTable.currentlyHeld > 0) {
          profitTable.unrealizedProfit = profitTable.realizedProfit + (profitTable.currentlyHeld * profitTable.currentFloor);
        }
        
        resolve(profitTable);    
    }).catch(async err => {
      console.error(err);
      currentlyBeingUsed = false;
    });
  });
}