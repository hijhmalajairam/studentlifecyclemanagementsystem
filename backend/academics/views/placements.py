from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response


class AIPlacementViewSet(viewsets.ViewSet):
    """ViewSet for AI-powered placement analysis."""
    
    @action(detail=False, methods=['post'])
    def analyze_resume(self, request):
        """
        Analyze resume against job description.
        
        Request body:
        {
            "resume_text": "...",
            "job_description": "..."
        }
        """
        resume_text = request.data.get('resume_text', '').lower()
        job_description = request.data.get('job_description', '').lower()
        
        if not resume_text or not job_description:
            return Response(
                {'error': 'resume_text and job_description are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Dummy skill keywords for matching
        all_skills = {
            'python': ['python', 'py'],
            'sql': ['sql', 'mysql', 'postgresql', 'database'],
            'docker': ['docker', 'containers'],
            'react': ['react', 'reactjs', 'jsx'],
            'nodejs': ['node', 'nodejs', 'express'],
            'java': ['java', 'spring'],
            'aws': ['aws', 'amazon'],
            'git': ['git', 'github', 'gitlab'],
        }
        
        matched_skills = []
        missing_skills = []
        
        # Check which skills are in resume
        for skill, keywords in all_skills.items():
            in_resume = any(keyword in resume_text for keyword in keywords)
            in_job_desc = any(keyword in job_description for keyword in keywords)
            
            if in_job_desc:
                if in_resume:
                    matched_skills.append(skill.title())
                else:
                    missing_skills.append(skill.title())
        
        # Calculate match score: (matched / total required) * 100
        total_required = len(matched_skills) + len(missing_skills)
        match_score = int((len(matched_skills) / total_required * 100)) if total_required > 0 else 0
        
        # Generate roadmap from missing skills
        roadmap = [f"Learn {skill}" for skill in missing_skills]
        
        return Response({
            'match_score': match_score,
            'matched_skills': matched_skills,
            'missing_skills': missing_skills,
            'roadmap': roadmap
        }, status=status.HTTP_200_OK)
