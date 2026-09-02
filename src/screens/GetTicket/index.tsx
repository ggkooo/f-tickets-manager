import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { DEFAULT_UNILAB_LOCATION } from '../../locations';
import { useRouteInstitution, useRouteLocation } from '../../locations/useRouteLocation';
import { createTicket } from '../../services/ticketService.ts';
import { getServiceOptions } from './constants';
import GetTicketFeedback from './components/GetTicketFeedback';
import GetTicketHero from './components/GetTicketHero';
import ServiceOptionsGrid from './components/ServiceOptionsGrid';
import type { FeedbackType } from './types';

const GetTicket: React.FC = () => {
    const routeLocation = useRouteLocation();
    const routeInstitution = useRouteInstitution();
    const activeLocation = routeLocation ?? DEFAULT_UNILAB_LOCATION;
    const serviceOptions = getServiceOptions(routeInstitution);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);

    useEffect(() => {
        if (feedbackType !== 'success' || !feedback) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setFeedback(null);
            setFeedbackType(null);
        }, 3000);

        return () => window.clearTimeout(timeoutId);
    }, [feedback, feedbackType]);

    const handleCreateTicket = async (serviceType: string) => {
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setSelectedService(serviceType);
        setFeedback(null);
        setFeedbackType(null);

        try {
            const result = await createTicket({ serviceType, location: activeLocation });
            const isBackgroundPrint = result.printStatus?.toLowerCase() === 'enviando';

            setFeedback(
                isBackgroundPrint
                    ? `Solicitacao recebida: ${serviceType}. Impressao em envio.`
                    : `Solicitacao enviada: ${serviceType}.`,
            );
            setFeedbackType('success');
        } catch (error) {
            setFeedback(error instanceof Error ? error.message : 'Falha de comunicação com a API.');
            setFeedbackType('error');
        } finally {
            setIsSubmitting(false);
            setSelectedService(null);
        }
    };

    return (
        <Layout contentClassName="mx-auto flex w-full max-w-[1180px] flex-grow flex-col justify-center px-4 py-3 sm:w-[96%] sm:px-5 sm:py-4 md:px-5 md:py-4 lg:w-[94%] lg:px-0 lg:py-5 xl:py-8" showHeader={false}>
            <section className="relative w-full overflow-hidden">
                <div className="pointer-events-none absolute -left-10 -top-8 h-40 w-40 rounded-full bg-blue-100/60 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-12 right-0 h-44 w-44 rounded-full bg-emerald-100/60 blur-3xl" />

                <div className="relative rounded-[2rem] border border-white/80 bg-gradient-to-br from-white via-white to-slate-100/80 p-4 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)] sm:p-5 md:p-6 lg:p-8">
                    <GetTicketHero />

                    {feedback && feedbackType && (
                        <GetTicketFeedback message={feedback} type={feedbackType} />
                    )}

                    <ServiceOptionsGrid
                        options={serviceOptions}
                        isSubmitting={isSubmitting}
                        selectedService={selectedService}
                        onSelectService={handleCreateTicket}
                    />
                </div>
            </section>
        </Layout>
    );
};

export default GetTicket;
