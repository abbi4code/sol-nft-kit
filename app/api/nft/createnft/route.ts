import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, keypairIdentity, percentAmount, publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";



const connection = new Connection(clusterApiUrl("devnet"))

export async function GET(request: Request){
    // const user = await getKeypairFromFile();
    const user = Keypair.generate();

    console.log("user", user.publicKey.toBase58())

    const airdropSol = await airdropIfRequired(connection,user.publicKey,2 * LAMPORTS_PER_SOL,0.4 * LAMPORTS_PER_SOL);

    console.log("Airdrop",airdropSol);

    //this will just createeeee a umi instance
    const umi = await createUmi(connection.rpcEndpoint);
    //this will add the token metadata extension to the umi instance
    umi.use(mplTokenMetadata())

    const umiuser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
    // so this identity we will use as a payer for the transactions
    umi.use(keypairIdentity(umiuser));

    const collectionAddress = publicKey("ChfGtd2wT12c2u82PHNpe4PdQ5PMqJnVECfaNbQ2uaVw")

    console.log("nft-creating in 0..1..2...")

    //so this willl generate a new keypair for the mint

    const mint = generateSigner(umi)

    const trasanction  = await createNft(umi, {
        mint,
        name: "My NFT",
        uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-nft-offchain-data.json",
        //setting the creator loyality
        sellerFeeBasisPoints: percentAmount(0),
        collection: {
            key: collectionAddress,
            verified: false
        }
    })

    await trasanction.sendAndConfirm(umi)

    const createdNFT = await fetchDigitalAsset(umi,mint.publicKey)

    console.log(`created NFT address is ${getExplorerLink("address",createdNFT.mint.publicKey),"devnet"}`)


    return new Response("NFT created",{
        status: 200
    })

}