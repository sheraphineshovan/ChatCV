from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_chroma import Chroma
import os
import tempfile
from typing import List
from langchain.schema import Document
from app.config import VECTOR_STORE_DIR, ALLOWED_EXTENSIONS, MAX_FILE_SIZE
from app.services.rag_chain import conversational_rag_chain
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def process_uploaded_file(file_content: bytes, filename: str, session_id: str) -> List[Document]:
    # Validate file size
    if len(file_content) > MAX_FILE_SIZE:
        raise ValueError(f"File size exceeds maximum allowed size of {MAX_FILE_SIZE / 1024 / 1024}MB")

    # Create a temporary file with the correct extension
    file_ext = os.path.splitext(filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {file_ext}. Please upload a PDF or DOCX file.")

    # Create a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
        temp_file.write(file_content)
        temp_file_path = temp_file.name

    try:
        # Load the document based on file type
        if file_ext == '.pdf':
            loader = PyPDFLoader(temp_file_path)
        else:  # .docx or .doc
            loader = Docx2txtLoader(temp_file_path)
        
        # Extract text from the document
        documents = loader.load()
        logger.info(f"Loaded {len(documents)} documents from {filename}")

        # Split documents into manageable chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        splits = text_splitter.split_documents(documents)
        logger.info(f"Split into {len(splits)} chunks")

        # Create embeddings using Hugging Face model
        model_name = "sentence-transformers/all-MiniLM-L6-v2"
        embeddings = HuggingFaceEmbeddings(model_name=model_name)
        
        # Create vector store with session ID
        persist_dir = os.path.join(VECTOR_STORE_DIR, session_id)
        os.makedirs(persist_dir, exist_ok=True)
        vectorstore = Chroma.from_documents(
            documents=splits,
            embedding=embeddings,
            persist_directory=persist_dir
        )
        logger.info(f"Vector store created for session {session_id}")

        # Create and add retriever to RAG chain
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
        conversational_rag_chain.add_retriever(session_id, retriever)
        logger.info(f"Added retriever to RAG chain for session {session_id}")

        return splits

    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        raise Exception(f"Error processing file: {str(e)}")
    finally:
        # Clean up the temporary file
        try:
            os.unlink(temp_file_path)
        except:
            pass