<?php

namespace App\Notifications\Modules\ServiceOrder;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
// Custom
use App\Models\Users\User;
use App\Models\ServiceOrders\ServiceOrder;

class ServiceOrderCreatedNotification extends Notification
{
    use Queueable;

    private $user;
    private $service_order;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(User $user, ServiceOrder $service_order)
    {
        $this->user = $user;
        $this->service_order = $service_order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('ORBIO - Nova ordem de serviço')
            ->greeting("Olá " . $notifiable->first_name . "!")
            ->line("Você está sendo notificado porque foi vinculado a uma nova ordem de serviço.")
            ->line("Data inicial: " . $this->service_order->start_date)
            ->line("Data final: " . $this->service_order->end_date)
            ->line("Número: " . $this->service_order->number)
            ->line("Observação: " . $this->service_order->observation)
            ->line("Criador: " . $this->service_order->users)
            ->line("Piloto: " . $this->service_order->users)
            ->line("Cliente: " . $this->service_order->users)
            ->action("Página de acesso", url(env("APP_URL")))
            ->line('Se não foi você quem requisitou o procedimento, ignore.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            //
        ];
    }
}
