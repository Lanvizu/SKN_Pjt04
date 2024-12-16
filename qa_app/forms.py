from django import forms

class FileUploadForm(forms.Form):
    file = forms.FileField()
    model_choice = forms.ChoiceField(choices=[('gpt-3.5-turbo', 'GPT-3.5 Turbo'), ('gpt-4', 'GPT-4')])