<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
// Controladores de autenticação
use App\Http\Controllers\Auth\LoginController; 
use App\Http\Controllers\Auth\RegistrationController; 
use App\Http\Controllers\Auth\ForgotPasswordController; 
// Controlador da entrada para o sistema interno
use App\Http\Controllers\Pages\CommonInternalController; 
// Controlador da seção interna "minha conta"
use App\Http\Controllers\Pages\AccountSectionController;
// Controladores dos módulos
use App\Http\Controllers\Modules\Administration\AdministrationModuleUserPanelController;
use App\Http\Controllers\Modules\Administration\AdministrationModuleProfilePanelController;
use App\Http\Controllers\Modules\Report\ReportModuleController;
use App\Http\Controllers\Modules\FlightPlan\FlightPlanModuleController;
use App\Http\Controllers\Modules\ServiceOrder\ServiceOrderModuleController;
use App\Http\Controllers\Modules\Incident\IncidentModuleController;

// ROTAS QUE RETORNAM AS VIEWS EXTERNAS 
Route::get('/', function(){ return redirect("/acessar"); }); 
Route::view('/acessar', "react_root"); 
Route::view('/recuperarsenha', "react_root"); 

// ROTAS DAS SEÇÕES INTERNAS, DO MAPA E DE SAÍDA  
Route::get('/sistema', [CommonInternalController::class, "index"])->middleware(["session.auth"]); 
Route::get('/sistema/{internalpage?}', [CommonInternalController::class, "refreshInternalSystem"])->where(["internalpage" => "^(?!sair|mapa).*$"]); 
Route::get('/sistema/sair', [CommonInternalController::class, "logout"]); 
Route::view('/sistema/mapa', "map")->middleware(["session.auth"]); 

// ===================================================================== ROTAS "/API/" ===================================================================== //

// OPERAÇÕES DE AUTENTICAÇÃO BÁSICAS 
Route::post('/api/acessar', [LoginController::class, "index"]); 
Route::post('/api/enviar-codigo', [ForgotPasswordController::class, "generateAndSendPasswordChangeToken"]); 
Route::post('/api/alterar-senha', [ForgotPasswordController::class, "passwordChangeProcessing"]); 
Route::post('/api/get-token-data', [CommonInternalController::class, "getDataFromTokenJwt"]); 

// OPERAÇÕES DA SEÇÃO INTERNA "MINHA CONTA"
Route::middleware(["session.auth"])->group(function(){
    Route::get('/api/user-account-data', [AccountSectionController::class, "loadUserAccountData"]);
    Route::patch('/api/update-basic-data/{id}', [AccountSectionController::class, "userBasicDataUpdate"]);
    Route::patch('/api/update-complementary-data/{id}', [AccountSectionController::class, "userComplementaryDataUpdate"]);
    Route::post("/api/desactivate-account/{id}", [AccountSectionController::class, "userAccountDesactivation"]);
});

// OPERAÇÕES DOS MÓDULOS 
Route::middleware(["session.auth", "modules.common.authorization"])->group(function(){
    Route::resource("/api/admin-module-user", AdministrationModuleUserPanelController::class);
    Route::resource("/api/admin-module-profile", AdministrationModuleProfilePanelController::class);
    Route::resource("/api/reports-module", ReportModuleController::class);
    Route::resource("/api/plans-module", FlightPlanModuleController::class);
    Route::get("/api/plans-module-download/{filename}", [FlightPlanModuleController::class, "downloadFlightPlanFile"]);
    Route::resource("/api/orders-module", ServiceOrderModuleController::class);
    Route::resource("/api/incidents-module", IncidentModuleController::class);
});



