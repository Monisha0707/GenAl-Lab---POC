# chatLangChain.py

# from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
# from langchain.chains import LLMChain
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate


# LangChain setup
llm = OllamaLLM(model="llama3")
template = """You are a helpful assistant. Answer the following question:\n{question}"""
prompt = PromptTemplate.from_template(template)
chain = prompt | llm


# This function can now be reused anywhere
def generate_llm_response(question: str):
    if not question:
        return {"error": "Missing prompt"}
    response = chain.invoke({"question": question})
    return response
