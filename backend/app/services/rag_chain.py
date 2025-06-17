from langchain_groq import ChatGroq
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from app.services.vector_store import VectorStoreManager, vector_store_manager
from pydantic import SecretStr
import logging
import os
from app.config import settings

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RAGChain:
    def __init__(self):
        try:
            api_key = settings.GROQ_API_KEY
            if not api_key:
                logger.error("GROQ_API_KEY is not set in environment variables")
                raise ValueError("GROQ_API_KEY is not set in environment variables")
            
            # Log the first few characters of the API key for debugging
            logger.info(f"Using GROQ API key starting with: {api_key[:8]}...")
                
            self.llm = ChatGroq(
                api_key=SecretStr(api_key),
                model="meta-llama/llama-4-scout-17b-16e-instruct"  # Using Llama2 model which is more widely available
            )
            logger.info("Successfully initialized ChatGroq LLM")
        except Exception as e:
            logger.error(f"Error initializing ChatGroq LLM: {str(e)}")
            raise

        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        self.retrievers = {}
        self.chains = {}  # Store chains for each session
        logger.info("RAGChain initialized successfully")

    def get_chain(self, session_id: str):
        # Check if we already have a chain for this session
        if session_id in self.chains:
            logger.info(f"Using existing chain for session {session_id}")
            return self.chains[session_id]

        retriever = self.retrievers.get(session_id)
        if not retriever:
            logger.error(f"No retriever found for session {session_id}")
            raise ValueError(f"No retriever found for session {session_id}")

        prompt_template = """You are a helpful AI assistant that helps users understand their resume content. 
        Use the following pieces of context to answer the question at the end. 
        If you don't know the answer, just say that you don't know, don't try to make up an answer.

        Context: {context}

        Chat History: {chat_history}
        Human: {question}
        Assistant:"""

        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "chat_history", "question"]
        )

        try:
            chain = ConversationalRetrievalChain.from_llm(
                llm=self.llm,
                retriever=retriever,
                memory=self.memory,
                combine_docs_chain_kwargs={"prompt": PROMPT}
            )
            # Store the chain for future use
            self.chains[session_id] = chain
            logger.info(f"Successfully created and stored chain for session {session_id}")
            return chain
        except Exception as e:
            logger.error(f"Error creating chain for session {session_id}: {str(e)}")
            raise

    async def astream(self, session_id: str, question: str):
        try:
            logger.info(f"Starting astream for session {session_id} with question: {question}")
            
            # Get or create chain for this session
            try:
                chain = self.get_chain(session_id)
            except ValueError as e:
                logger.warning(f"Chain creation failed for session {session_id}: {str(e)}")
                yield "No resume data found. Please upload a resume first."
                return

            # Get relevant documents
            retriever = self.retrievers.get(session_id)
            if not retriever:
                logger.warning(f"No retriever found for session {session_id}")
                yield "No resume data found. Please upload a resume first."
                return

            logger.info(f"Retrieved documents for question: {question}")
            context = retriever.get_relevant_documents(question)
            logger.info(f"Found {len(context)} relevant documents")

            if not context:
                logger.warning(f"No relevant documents found for question: {question}")
                yield "No relevant information found in the resume."
                return

            # Generate prompt for LLM
            logger.info("Generating prompt for LLM")
            prompt = f"""Based on the following resume content, please answer the question. 
            If the information is not in the resume, say so.

            Resume Content:
            {' '.join([doc.page_content for doc in context])}

            Question: {question}

            Answer:"""

            # Stream the response
            logger.info("Starting LLM response stream")
            try:
                async for chunk in self.llm.astream(prompt):
                    if chunk.content:
                        logger.debug(f"Received chunk from LLM: {chunk.content[:50]}...")
                        yield chunk.content
            except Exception as e:
                logger.error(f"Error streaming LLM response: {str(e)}")
                yield f"Error getting response from AI: {str(e)}"

            logger.info("Completed LLM response stream")

        except Exception as e:
            logger.error(f"Error in RAG chain for session {session_id}: {str(e)}")
            yield f"Error processing your question: {str(e)}"

    def add_retriever(self, session_id: str, retriever):
        try:
            self.retrievers[session_id] = retriever
            # Clear any existing chain for this session
            if session_id in self.chains:
                del self.chains[session_id]
            logger.info(f"Successfully added retriever for session {session_id}")
        except Exception as e:
            logger.error(f"Error adding retriever for session {session_id}: {str(e)}")
            raise

# Create a single instance of RAGChain
conversational_rag_chain = RAGChain()