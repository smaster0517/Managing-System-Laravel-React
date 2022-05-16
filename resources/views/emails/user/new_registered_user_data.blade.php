<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style = "margin:0; padding:0; width:100%; height:100vh; display:flex; flex-direction:column; font-family:Helvetica, Arial, sans-serif;">

    <div style = "width:100%; flex-basis:80px; display:flex ;flex-direction:column;justify-content: center; align-items:center ;background-color: #F5F8FA;color: #BBBFC3;">
        <h1>ORBIO</h1>
    </div>

    <div style = "flex-grow: 1;display: flex;justify-content: center; align-items: center;">
        <div style = "width: 400px;  color: #74787E;">
            <p style = "color:black; text-align:justify;"><b>{{ $title }}</b></p>
            <div class = "section_header">
                <p style="text-align: justify;"><b>{{ $header_text }}</b></p>
            </div>
            <div class = "section_body">
                <p style = "text-align:justify;">Nome: {{ $body["name"] }}</p>
                <p style = "text-align:justify;">Email: {{ $body["email"] }}</p>
                <p style = "text-align:justify;">Senha: {{ $body["password"] }}</p>
                <p style = "text-align:justify;">Perfil: {{ $body["profile"] }}</p>
                <p style = "text-align:justify;">Data da criação: {{ $body["created_at"] }}</p>
            </div>
            <div class = "section_footer">
                <p style = "text-align:justify;">Após o primeiro acesso sua conta será ativada. Não se esqueça, após isso, de atualizar os seus dados de cadastro.</p>
                <p style = "text-align:justify;"><a href = "{{ env('APP_URL') }}/acessar" >Acessar</a></p> 
            </div>
            <hr>
            <p>Atenciosamente, equipe ORBIO.</p>
    </div>
    </div>

    <div style = "width:100%; flex-basis:80px; display:flex ;flex-direction:column;justify-content: center; align-items:center ;background-color: #F5F8FA;color: #BBBFC3;">
        <p style = "text-align:justify;">&copy; Orbio. Todos os direitos reservados.</p>
    </div>
    
</body>
</html>