
export async function getTezIDProofs(network, address) {
  return await fetch(`https://tezid.net/api/${network}/getproofs/${address}`)
    .then(res => res.json())
}
