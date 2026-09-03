import type { Institution } from '../../locations';
import type { ServiceOption } from './types';

export const UNILAB_SERVICE_OPTIONS: ServiceOption[] = [
    {
        icon: 'support_agent',
        title: 'Atendimento Normal',
        subtitle: 'Atendimento geral para orientações e solicitações comuns.',
    },
    {
        icon: 'priority_high',
        title: 'Atendimento Preferencial',
        subtitle: 'Prioridade para os públicos com atendimento preferencial.',
        badges: [
            { icon: 'elderly', label: '60+' },
            { icon: 'pregnant_woman', label: 'Gestante' },
            { icon: 'child_care', label: 'Criança de colo' },
            { imageSrc: '/assets/img/icons/campanha-de-fita-autismo.png', label: 'Autista' },
            { icon: 'accessible', label: 'Deficiente' },
        ],
    },
    {
        icon: 'inventory_2',
        title: 'Retirada de Exames ou Entrega de Amostras',
        subtitle: 'Atendimento para recebimento de exames ou entrega de amostras.',
        fullWidth: true,
    },
];

export const CRE_SERVICE_OPTIONS: ServiceOption[] = [
    {
        icon: 'school',
        title: 'Acadêmico/Matrículas',
        subtitle: 'Dúvidas acadêmicas, matrícula, rematrícula e trancamento.',
    },
    {
        icon: 'description',
        title: 'Solicitação de Documentos',
        subtitle: 'Histórico escolar, declarações, atestados e certificados.',
    },
    {
        icon: 'receipt_long',
        title: 'Impressão de Boletos',
        subtitle: 'Emissão e reimpressão de boletos de mensalidade.',
    },
    {
        icon: 'account_balance',
        title: 'Financiamentos e Bolsas',
        subtitle: 'Informações sobre financiamento estudantil e programas de bolsa.',
    },
    {
        icon: 'handshake',
        title: 'Renegociação de Mensalidades',
        subtitle: 'Acordos, parcelamento e renegociação de débitos.',
        fullWidth: true,
    },
];

export const getServiceOptions = (institution: Institution | null): ServiceOption[] =>
    institution === 'cre' ? CRE_SERVICE_OPTIONS : UNILAB_SERVICE_OPTIONS;
