import { ChatMistralAI } from "@langchain/mistralai";
import { config } from "dotenv";
import rl from"readline/promises"
import { HumanMessage , AIMessage,AIMessageChunk , SystemMessage , tool, createAgent} from "langchain"
import { tavily } from "@tavily/core"
import * as z from "zod"

config();

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

async function get_latest_information({query}){

    const response = await tvly.search(query)

    const results = response.results

    const content = results.map(result => result.content).join("\n\n\n")

    return content
}


function getLastestInformation ({ query}) {
    return "India is recently in technology and is a hub for software development and IT service. The country has a growing startup ecosystem , with many innovation compaines emerging in various sectors such as fintech ,healthtech, and edtech. Additonally, Indian has made significant."
}

const getLastestInformationTool = tool(
    getLastestInformation,
    {
        name:"get_latest_information",
        description:"Gen lastest information about any topic",
        schema: z.object({
            query:z.string().describe("The topic to get latest information about")
        })
        
})
const readline = rl.createInterface({
    input: process.stdin,
    output: process.stdout
})

const model = new ChatMistralAI({
    model:"mistral-small-latest",
    apiKey: process.env.MISTRAL_API_KEY
})

const agent = createAgent({
    model,
    tools:[getLastestInformationTool]
})

const messages =[
    new SystemMessage(` Your name is alex , You are joyful , senoir developer who loves to explain things related to MERN stack`)
]

while (true) {

const userPrompt = await readline.question("User: ")

messages.push(new HumanMessage(userPrompt))

const stream = await agent.stream({
    messages,
},{
    streamMode:"messages"
}
)

let aiResponse =""

for await (const [ chunk ] of stream){
    if(chunk instanceof AIMessageChunk){
    process.stdout.write(chunk.text)
    aiResponse += chunk.text
}
}
messages.push(new AIMessage(aiResponse))

process.stdout.write("\n")
}