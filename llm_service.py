import os
from typing import List, Optional, Type
from pydantic import BaseModel, Field
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_huggingface import HuggingFaceEndpoint
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

# ==============================================================================
# Pydantic Models for Structured Output
# ==============================================================================

class SkillNode(BaseModel):
    parent_category: str = Field(description="The broad category of the skill (e.g., 'Backend Development', 'Cloud Infrastructure')")
    skill_node: str = Field(description="The specific technical skill (e.g., 'FastAPI', 'Kubernetes')")
    relationship_level: str = Field(description="The proficiency or relationship level extracted (e.g., 'Expert', 'Intermediate', 'Used in Production')")

class SkillTreeResponse(BaseModel):
    skills: List[SkillNode] = Field(description="List of skill nodes extracted from the user's activity and CV.")

class CareerPath(BaseModel):
    target_role: str = Field(description="The forecasted target role based on current skills and market trends.")
    narrative: str = Field(description="A detailed narrative explaining the career path and market trends.")
    gap_analysis: List[str] = Field(description="List of skills or experiences the user is missing to achieve the target role.")
    recommended_actions: List[str] = Field(description="List of recommended actions to bridge the gap.")

class ResumeBulletsResponse(BaseModel):
    bullets: List[str] = Field(description="Polished resume bullets generated from the user's work activity and CV.")

# ==============================================================================
# LLM Service Abstraction
# ==============================================================================

def get_llm(agent_name: str = "agent1"):
    print(f"Executing: llm_service.py -> get_llm() [agent_name: {agent_name}]")
    """
    Returns a LangChain LLM instance based on the .env configuration for the specific agent.
    Defaults to HuggingFace. Set AGENT1_MODEL=gemini or AGENT2_MODEL=gemini to use Google Gemini.
    """
    model_choice = os.getenv(f"{agent_name.upper()}_MODEL", "huggingface").lower()
    
    if model_choice == "gemini":
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError(f"GEMINI_API_KEY is missing but {agent_name.upper()}_MODEL is set to gemini.")
        model_name = os.getenv(f"{agent_name.upper()}_MODEL_NAME", "gemini-1.5-pro")
        return ChatGoogleGenerativeAI(
            model=model_name,
            temperature=0.2,
            google_api_key=api_key
        )
    else:
        api_key = os.getenv("HUGGINGFACE_API_KEY")
        if not api_key:
            raise ValueError(f"HUGGINGFACE_API_KEY is missing but {agent_name.upper()}_MODEL is set to huggingface.")
        repo_id = os.getenv(f"{agent_name.upper()}_MODEL_NAME", "mistralai/Mistral-7B-Instruct-v0.2")
        return HuggingFaceEndpoint(
            repo_id=repo_id,
            temperature=0.2,
            huggingfacehub_api_token=api_key,
            max_new_tokens=4096,
            task="conversational"
        )

def generate_structured_response(system_prompt: str, user_prompt: str, pydantic_model: Type[BaseModel], agent_name: str = "agent1") -> BaseModel:
    print(f"Executing: llm_service.py -> generate_structured_response() [agent_name: {agent_name}, model: {pydantic_model.__name__}]")
    """
    Generates a structured response conforming to the provided Pydantic model.
    """
    llm = get_llm(agent_name)
    if isinstance(llm, ChatGoogleGenerativeAI):
        structured_llm = llm.with_structured_output(pydantic_model)
        prompt = PromptTemplate(
            template="{system_prompt}\n\nUser Request: {user_prompt}\n",
            input_variables=["system_prompt", "user_prompt"],
        )
        chain = prompt | structured_llm
        return chain.invoke({"system_prompt": system_prompt, "user_prompt": user_prompt})
    else:
        parser = PydanticOutputParser(pydantic_object=pydantic_model)
        prompt = PromptTemplate(
            template="{system_prompt}\n\n{format_instructions}\n\nUser Request: {user_prompt}\n",
            input_variables=["system_prompt", "user_prompt"],
            partial_variables={"format_instructions": parser.get_format_instructions()},
        )
        chain = prompt | llm | parser
        return chain.invoke({"system_prompt": system_prompt, "user_prompt": user_prompt})

