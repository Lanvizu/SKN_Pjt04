from django.shortcuts import render
from django.http import JsonResponse
from .forms import FileUploadForm
from .utils import load_file, split_text, upload_data_if_not_exists, search_in_pinecone, generate_with_gpt, index, embedding_model
from django.views.decorators.csrf import csrf_exempt
import json

def index(request):
    if request.method == 'POST':
        form = FileUploadForm(request.POST, request.FILES)
        if form.is_valid():
            uploaded_file = request.FILES['file']
            file_content = load_file(uploaded_file)
            split_texts = split_text(file_content)
            file_name = uploaded_file.name.split('.')[0]
            upload_data_if_not_exists(split_texts, index, file_name)
            return JsonResponse({'message': '파일이 성공적으로 처리되었습니다.'})
    else:
        form = FileUploadForm()
    return render(request, 'qa_app/index.html', {'form': form})

@csrf_exempt
def chat(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        query = data.get('query')
        model = data.get('model', 'gpt-3.5-turbo')
        
        search_results = search_in_pinecone(query, index, embedding_model)
        
        if search_results:
            context = "\n".join([match.metadata['text'] for match in search_results.matches])
            gpt_prompt = f"다음 내용을 바탕으로 사용자의 질문에 답해주세요: {query}\n\n{context}"
            response_gpt = generate_with_gpt(gpt_prompt, model=model)
            
            return JsonResponse({
                'answer': response_gpt,
                'sources': [
                    {
                        'text': match.metadata.get('text', '')[:400],
                        'source': match.metadata.get('source', '알 수 없음').split('_')[1]
                    } for match in search_results.matches[:3]
                ]
            })
        else:
            return JsonResponse({'answer': '검색 결과가 없습니다.'})
    
    return render(request, 'qa_app/chat.html')
