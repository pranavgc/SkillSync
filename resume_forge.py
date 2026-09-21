import json
from langchain_community.tools import DuckDuckGoSearchRun
from pydantic import ValidationError

from llm_service import get_llm, SkillTreeResponse, ResumeBulletsResponse, SkillNode
from storage_service import save_skill_tree, save_resume_bullets, get_parsed_cv, get_skill_tree, get_resume_bullets
import asyncio

async def process_activity_payload(payload: dict):
    print("Executing: resume_forge.py -> process_activity_payload() [START]")
    """
    Agent 1: ResumeForge + SkillTree Extraction.
    """
    uid = payload.get("user_id")
    if not uid:
        raise ValueError("Missing user_id in payload")
        
    content = payload.get("content", "")
    source = payload.get("source", "unknown")
    
    cv_text = get_parsed_cv(uid)
    existing_skills = get_skill_tree(uid)
    existing_bullets = get_resume_bullets(uid)
    
    has_activity = bool(content.strip())
    has_cv = bool(cv_text.strip())
    
    if not has_activity and not has_cv:
        print("No CV or activity data available. Skipping resume forge.")
        return {"status": "skipped"}
    
    context_summary = ""
    if has_activity:
        # Initialize the LLM and the tool
        llm = get_llm(agent_name="agent1")
        # 1. Ask the agent to understand the content.
        research_prompt = f"""
        You are an expert recruiter and talent analyst.
        Analyze the following work activity from {source}.
        
        Work Activity:
        {content}
        
        Summarize the key technologies, non-technical skills, assets, job-related experience, the context of the work, and the impact. 
        """
        
        try:
            context_summary = llm.invoke(research_prompt)
            if hasattr(context_summary, "content"):
                context_summary = context_summary.content
        except Exception as e:
            print(f"Agent research failed, using fallback: {e}")
            context_summary = f"Analyzed {source} activity regarding: {content}"
            
    # Rate limit padding
    await asyncio.sleep(8)
            
    # 2. Extract Skill Tree using Structured Output
    print("Executing: resume_forge.py -> process_activity_payload() -> Extracting Skill Tree")
    from llm_service import generate_structured_response
    
    skill_tree_system_prompt = """
    You are an expert talent capabilities extractor.
    Given the user's CV, their recent work activity, and context, extract a hierarchical list of ALL skills and assets.
    This MUST include:
    1. Hard Technical Skills
    2. Non-Technical / Soft Skills (e.g., Leadership, Communication)
    3. Professional Assets & Domain Knowledge (e.g., B2B Sales, Product Strategy)
    4. Job-Related Experience (e.g., Team Management, Agile Methodologies)
    
    Group them into broad logical categories (parent_category) and specify the exact skill or asset (skill_node).
    Estimate the relationship_level based on the context (e.g., 'Used in Production', 'Expert', 'Familiar', 'Demonstrated').
    
    CRITICAL INSTRUCTION: DO NOT hallucinate or infer skills that are not explicitly mentioned or clearly implied by the provided text. If the provided CV and Work Activity are empty or contain no relevant skills, you MUST return an empty array for the skills list. Do not use generic placeholders.
    """
    
    skill_tree_user_prompt = f"""
    CV Text: {cv_text}
    Work Activity: {content}
    Context Summary: {context_summary}
    """
    
    try:
        new_skill_tree: SkillTreeResponse = generate_structured_response(
            system_prompt=skill_tree_system_prompt,
            user_prompt=skill_tree_user_prompt,
            pydantic_model=SkillTreeResponse,
            agent_name="agent1"
        )
        
        # Merge with existing skills (simple de-duplication by skill_node name)
        merged_skills_dict = {s.get("skill_node", "").lower(): SkillNode(**s) for s in existing_skills}
        for skill in new_skill_tree.skills:
            merged_skills_dict[skill.skill_node.lower()] = skill
            
        save_skill_tree(uid, list(merged_skills_dict.values()))
    except Exception as e:
        import traceback
        print("====== SKILL TREE GENERATION ERROR ======")
        traceback.print_exc()
        print("=========================================")
        print(f"Failed to generate Skill Tree: {e}")

    # Rate limit padding
    await asyncio.sleep(8)

    # 3. Generate Resume Bullets
    print("Executing: resume_forge.py -> process_activity_payload() -> Generating Resume Bullets")
    bullets_system_prompt = """
    You are a professional resume writer.
    Based on the user's CV, work activity, and context, generate 2-3 polished, impact-driven resume bullets using the STAR method (Situation, Task, Action, Result).
    
    CRITICAL INSTRUCTION: DO NOT hallucinate metrics, impact, or technologies that are not explicitly present in the provided text. If there is not enough information to write a factual bullet point, return an empty array. Do not invent details. Only output the bullets.
    """
    
    try:
        new_bullets_response: ResumeBulletsResponse = generate_structured_response(
            system_prompt=bullets_system_prompt,
            user_prompt=skill_tree_user_prompt,
            pydantic_model=ResumeBulletsResponse,
            agent_name="agent1"
        )
        
        updated_bullets = existing_bullets + new_bullets_response.bullets
        # Keep only the last 15 bullets to avoid bloating
        updated_bullets = updated_bullets[-15:]
        save_resume_bullets(uid, updated_bullets)
    except Exception as e:
        import traceback
        print("====== RESUME BULLETS GENERATION ERROR ======")
        traceback.print_exc()
        print("=============================================")
        print(f"Failed to generate Resume Bullets: {e}")

    return {"status": "success"}
