from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OpenAIEmbeddings, SentenceTransformerEmbeddings
import os

class VectorStoreManager:
    def __init__(self, persist_directory="./chroma_db"):
        self.persist_directory = persist_directory
        self.vectorstore = None

    def initialize_vector_store(self):
        if not os.path.exists(self.persist_directory):
            os.makedirs(self.persist_directory)
        self.vectorstore = Chroma(persist_directory=self.persist_directory)

    def add_documents(self, documents):
        embeddings = OpenAIEmbeddings()  # or use SentenceTransformerEmbeddings
        self.vectorstore.add_documents(documents, embeddings)

    def retrieve_documents(self, query, k=3):
        return self.vectorstore.similarity_search(query, k=k)

    def persist(self):
        self.vectorstore.persist()

    def load(self):
        self.vectorstore = Chroma.load(self.persist_directory)

def get_retriever():
    # Initialize the vector store manager and load or create the vector store
    manager = VectorStoreManager()
    manager.initialize_vector_store()
    # Use SentenceTransformerEmbeddings for free, local embeddings
    embedding = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    # Create a Chroma vectorstore instance with the embedding function
    vectorstore = Chroma(
        persist_directory=manager.persist_directory,
        embedding_function=embedding
    )
    # Return a retriever object
    return vectorstore.as_retriever(search_kwargs={"k": 3})