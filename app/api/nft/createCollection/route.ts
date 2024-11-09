import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { airdropIfRequired, getExplorerLink } from "@solana-developers/helpers";
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js"

const connection = new Connection(clusterApiUrl("devnet"))


export async function GET(request: Request){
    const user = Keypair.generate();

    await airdropIfRequired(connection,user.publicKey,2 * LAMPORTS_PER_SOL,0.4 * LAMPORTS_PER_SOL);

    const umi = createUmi(connection.rpcEndpoint)
    umi.use(mplTokenMetadata())

    const umiuser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
    umi.use(keypairIdentity(umiuser))

    //user private key will authorize the transaction
    const collectionMint = generateSigner(umi)

    const transaction  = await createNft(umi, {
        mint: collectionMint,
        name: "My Collection",
        symbol: "MC",
        uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-nft-collection-offchain-data.json",
        sellerFeeBasisPoints: percentAmount(0),
        isCollection: true
    })

    await transaction.sendAndConfirm(umi)

    const createdCollectionNft = await fetchDigitalAsset(umi,collectionMint.publicKey)

    return new Response( `Created Collection 📦! Address is ${getExplorerLink(
        "address",
        createdCollectionNft.mint.publicKey,
        "devnet"
      )}`,{
        status: 200
    })

}