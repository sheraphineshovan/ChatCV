from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
import os

async def process_uploaded_file(file_content: bytes, filename: str):
    # Save the uploaded file to a temporary location
    file_path = f"/tmp/{filename}"
    with open(file_path, "wb") as f:
        f.write(file_content)

    # Load the PDF file and extract text
    loader = PyPDFLoader(file_path)
    documents = loader.load()

    # Clean up temporary file
    os.remove(file_path)

    # Split documents into manageable chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(documents)

    # Create embeddings for the document chunks
    embeddings = OpenAIEmbeddings()
    vectorstore = Chroma.from_documents(
        documents=splits,
        embedding=embeddings,
        persist_directory="./chroma_db"
    )

    return vectorstore