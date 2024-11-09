import { findMetadataPda, mplTokenMetadata, verifyCollectionV1 } from "@metaplex-foundation/mpl-token-metadata";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";



const connection = new Connection(clusterApiUrl("devnet"))

export async function GET(request: Request){

   const user = Keypair.generate();

   const umi = createUmi(connection.rpcEndpoint)
   umi.use(mplTokenMetadata())

   const umiuser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
   umi.use(keypairIdentity(umiuser))


   const collectionAddress = publicKey("ChfGtd2wT12c2u82PHNpe4PdQ5PMqJnVECfaNbQ2uaVw")

   const nftAddress = publicKey("3Z5")

   const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, {mint: nftAddress}),
    collectionMint: collectionAddress,
    authority: umi.identity
   })

   await transaction.sendAndConfirm(umi)

    return new Response("Collection Verified",{
         status: 200
    })
}