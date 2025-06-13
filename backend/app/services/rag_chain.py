from langchain_community.llms import Ollama
from langchain.prompts import ChatPromptTemplate
from app.services.vector_store import get_retriever  

class RAGChain:
    def __init__(self, retriever):
        self.retriever = retriever
        self.llm = Ollama(model="mistral")  # Use Mistral via Ollama
        self.prompt_template = ChatPromptTemplate.from_template(
            """Answer the question based only on the following context:
            {context}

            Question: {question}
            """
        )

    def run(self, question):
        context = self.retriever.get_relevant_documents(question)
        prompt = self.prompt_template.format(context=context, question=question)
        response = self.llm(prompt)
        return response

    async def astream(self, question):
        context = self.retriever.get_relevant_documents(question)
        prompt = self.prompt_template.format(context=context, question=question)
        async for chunk in self.llm.astream(prompt):
            yield chunk

retriever = get_retriever()  
conversational_rag_chain = RAGChain(retriever)