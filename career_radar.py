import json
from langchain_community.tools import DuckDuckGoSearchRun
from pydantic import ValidationError

from llm_service import get_llm, CareerPath, generate_structured_response
from storage_service import save_job_market_research, save_career_path, get_skill_tree
import asyncio

async def run_career_radar_agent(uid: str):
    print("Executing: career_radar.py -> run_career_radar_agent() [START]")
    """
    Agent 2: CareerRadar.
    """
    from storage_service import get_parsed_cv
    existing_skills = get_skill_tree(uid)
    
    if not existing_skills:
        cv_text = get_parsed_cv(uid)
        if not cv_text:
            raise ValueError("No skill tree and no CV found for user. Please upload CV or ingest activity first.")
        skill_summary = f"Raw CV Data: {cv_text[:2000]}..."
    else:
        skill_summary = ", ".join([s.get("skill_node", "") for s in existing_skills])
    
    llm = get_llm(agent_name="agent2")
    llm = get_llm(agent_name="agent2")
    
    # 1. Autonomous Web Research
    print("Executing: career_radar.py -> run_career_radar_agent() -> Autonomous Web Research")
    try:
        search = DuckDuckGoSearchRun()
        search_result = search.invoke(f"Current job market trends, salary, and demand for {skill_summary}")
        
        research_prompt = f"""
        You are an expert career advisor and tech market researcher.
        The user has the following skills: {skill_summary}.
        
        Here is the live market research data from DuckDuckGo:
        {search_result}
        
        Synthesize this data into a comprehensive research report.
        Find out:
        1. Trending job titles for these skills.
        2. In-demand adjacent skills that the user might be missing.
        3. Salary bands for these roles.
        4. General hiring trends.
        """
        raw_research = llm.invoke(research_prompt)
        if hasattr(raw_research, "content"):
            raw_research = raw_research.content
    except Exception as e:
        print(f"Agent research failed, using fallback: {e}")
        raw_research = f"Market research failed due to error: {e}. Fallback: Demand for {skill_summary} remains strong."
        
    # Save the raw research to storage
    save_job_market_research(uid, {"raw_research": raw_research})
    
    # Rate limit padding
    await asyncio.sleep(8)
    
    # 2. Gap Analysis and Career Path Generation
    print("Executing: career_radar.py -> run_career_radar_agent() -> Career Path Generation")
    career_path_system_prompt = """
    You are an AI Career Strategist.
    Based on the user's current skills and the live job market research provided, synthesize a career path forecast.
    Identify a target role, provide a narrative of why this role fits, and perform a gap analysis (what skills are missing).
    List recommended actions to bridge the gap.
    
    CRITICAL INSTRUCTION: DO NOT hallucinate. Do not invent target roles or gap analysis details if there is insufficient information. Rely strictly on the provided skills and market research. If the user's skills are blank, you must return an empty/neutral forecast rather than making things up.
    """
    
    career_path_user_prompt = f"""
    User Skills: {skill_summary}
    
    Live Market Research:
    {raw_research}
    """
    
    try:
        career_path: CareerPath = generate_structured_response(
            system_prompt=career_path_system_prompt,
            user_prompt=career_path_user_prompt,
            pydantic_model=CareerPath,
            agent_name="agent2"
        )
        
        path_dict = career_path.model_dump()
        save_career_path(uid, path_dict)
        return path_dict
        
    except Exception as e:
        print(f"Failed to generate Career Path: {e}")
        raise e
