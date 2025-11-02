from langchain_community.llms import Ollama
from langchain.memory import ConversationSummaryBufferMemory

# ✅ Ollama LLM instance
llm = Ollama(model="llama3.2:latest")

# ✅ Memory that summarizes older parts of conversation
memory = ConversationSummaryBufferMemory(llm=llm, max_token_limit=2000)
