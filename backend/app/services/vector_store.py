from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader
from langchain_core.documents import Document
import os
from typing import List, Optional, Dict, Any, Sequence
from app.config import settings
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VectorStoreManager:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
        self.vector_store = Chroma(
            persist_directory=str(settings.VECTOR_STORE_DIR),
            embedding_function=self.embeddings
        )

    def create_vector_store(self, documents: List[str], session_id: str) -> None:
        """Create a new vector store for the given documents."""
        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        texts = text_splitter.create_documents(documents)
        logger.info(f"Created {len(texts)} chunks for session {session_id}")
        
        # Create and persist the vector store
        persist_dir = os.path.join(settings.VECTOR_STORE_DIR, session_id)
        os.makedirs(persist_dir, exist_ok=True)
        logger.info(f"Created directory for vector store at {persist_dir}")
        
        self.vector_store = Chroma.from_documents(
            documents=texts,
            embedding=self.embeddings,
            persist_directory=persist_dir
        )
        logger.info(f"Vector store created and persisted for session {session_id}")

    def get_vector_store(self, session_id: str) -> Optional[Chroma]:
        """Get the vector store for the given session ID."""
        persist_dir = os.path.join(settings.VECTOR_STORE_DIR, session_id)
        if not os.path.exists(persist_dir):
            logger.warning(f"No vector store found for session {session_id}")
            return None
        logger.info(f"Retrieving vector store for session {session_id}")
        try:
            return Chroma(
                persist_directory=persist_dir,
                embedding_function=self.embeddings
            )
        except Exception as e:
            logger.error(f"Error loading vector store for session {session_id}: {e}")
            return None

    def get_resume_text(self, session_id: str) -> str:
        """Get the full text of the resume for a session."""
        documents = self.retrieve_documents(session_id, "", k=100)  # Get all documents
        return "\n".join(doc.page_content for doc in documents)

    def add_documents(self, session_id: str, documents: Sequence[Document]) -> None:
        """Add documents to the vector store."""
        self.vector_store.add_documents(list(documents))  # Convert Sequence to List
        self.vector_store.persist()

    def retrieve_documents(self, session_id: str, query: str, k: int = 4) -> Sequence[Document]:
        """Retrieve relevant documents for a query."""
        return self.vector_store.similarity_search(query, k=k)

    def get_retriever(self, session_id: str):
        """Get a retriever object for the vector store."""
        vector_store = self.get_vector_store(session_id)
        if not vector_store:
            logger.warning(f"No vector store found for session {session_id}")
            return None
        logger.info(f"Retrieved vector store for session {session_id}")
        return vector_store.as_retriever(search_kwargs={"k": 3})

vector_store_manager = VectorStoreManager()