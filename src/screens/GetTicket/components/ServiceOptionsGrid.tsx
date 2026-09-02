import React from 'react';
import ActionCard from '../../../components/ui/ActionCard';
import { getServiceColor } from '../../../constants/serviceTypeColors';
import type { ServiceOption } from '../types';

type ServiceOptionsGridProps = {
    options: ServiceOption[];
    isSubmitting: boolean;
    selectedService: string | null;
    onSelectService: (serviceType: string) => void;
};

const ServiceOptionsGrid: React.FC<ServiceOptionsGridProps> = ({
    options,
    isSubmitting,
    selectedService,
    onSelectService,
}) => {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:gap-5">
            {options.map((service) => (
                <div key={service.title} className={service.fullWidth ? 'h-full sm:col-span-2' : 'h-full'}>
                    <ActionCard
                        icon={service.icon}
                        title={service.title}
                        subtitle={isSubmitting && selectedService === service.title ? 'Enviando solicitação...' : service.subtitle}
                        variant={getServiceColor(service.title)}
                        badges={service.badges}
                        onClick={() => onSelectService(service.title)}
                    />
                </div>
            ))}
        </div>
    );
};

export default ServiceOptionsGrid;
