"use client";

import { Card, Typography, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Logo from "../components/Logo";

const { Title, Paragraph, Text } = Typography;

export default function PrivacidadePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Logo />
        </div>

        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          className="mb-4"
        >
          Voltar
        </Button>

        <Card>
          <Typography>
            <Title level={2}>Politica de Privacidade</Title>
            <Paragraph>
              <Text strong>Ultima atualizacao:</Text> Janeiro de 2026
            </Paragraph>

            <Title level={4}>1. Dados que Coletamos</Title>
            <Paragraph>
              O Venha coleta apenas os dados necessarios para o funcionamento do
              sistema de convites:
            </Paragraph>
            <Paragraph>
              <Text strong>Para anfitrioes (hosts):</Text>
              <ul>
                <li>Nome</li>
                <li>Email (para login)</li>
                <li>Numero de WhatsApp (para contato dos convidados)</li>
                <li>Senha (armazenada de forma criptografada)</li>
              </ul>
            </Paragraph>
            <Paragraph>
              <Text strong>Para convidados:</Text>
              <ul>
                <li>Nome</li>
                <li>Numero de WhatsApp</li>
                <li>Numero de adultos e criancas</li>
                <li>Comentarios opcionais (alergias, necessidades especiais)</li>
              </ul>
            </Paragraph>

            <Title level={4}>2. Como Usamos seus Dados</Title>
            <Paragraph>
              <ul>
                <li>
                  <Text strong>Autenticacao:</Text> Email e senha sao usados
                  apenas para login no sistema
                </li>
                <li>
                  <Text strong>Comunicacao:</Text> O numero de WhatsApp do
                  anfitriao e exibido aos convidados para contato direto
                </li>
                <li>
                  <Text strong>Gerenciamento de eventos:</Text> Os dados de RSVP
                  sao usados para gerar listas de convidados
                </li>
              </ul>
            </Paragraph>

            <Title level={4}>3. Compartilhamento de Dados</Title>
            <Paragraph>
              <Text strong>Nao vendemos nem compartilhamos seus dados</Text> com
              terceiros para fins de marketing. Os dados sao compartilhados
              apenas:
            </Paragraph>
            <Paragraph>
              <ul>
                <li>
                  Entre anfitriao e convidados do mesmo evento (nome, WhatsApp)
                </li>
                <li>
                  Com servicos essenciais para funcionamento (servidor de
                  hospedagem)
                </li>
              </ul>
            </Paragraph>

            <Title level={4}>4. Seguranca</Title>
            <Paragraph>
              <ul>
                <li>Senhas sao criptografadas usando bcrypt</li>
                <li>Conexoes sao protegidas por HTTPS</li>
                <li>
                  Cookies de sessao sao configurados com protecoes de seguranca
                </li>
              </ul>
            </Paragraph>

            <Title level={4}>5. Seus Direitos</Title>
            <Paragraph>
              Voce tem direito a:
              <ul>
                <li>
                  <Text strong>Acessar</Text> seus dados pessoais
                </li>
                <li>
                  <Text strong>Corrigir</Text> informacoes incorretas
                </li>
                <li>
                  <Text strong>Excluir</Text> sua conta e dados associados
                </li>
                <li>
                  <Text strong>Cancelar</Text> confirmacoes de presenca (RSVP)
                </li>
              </ul>
            </Paragraph>

            <Title level={4}>6. Retencao de Dados</Title>
            <Paragraph>
              <ul>
                <li>
                  Dados de eventos sao mantidos enquanto a conta do anfitriao
                  estiver ativa
                </li>
                <li>
                  Anfitrioes podem excluir eventos e todos os RSVPs associados a
                  qualquer momento
                </li>
                <li>
                  Convidados podem cancelar sua presenca, o que mantem um
                  registro do cancelamento
                </li>
              </ul>
            </Paragraph>

            <Title level={4}>7. Contato</Title>
            <Paragraph>
              Para questoes sobre privacidade ou para exercer seus direitos,
              entre em contato com o administrador do sistema.
            </Paragraph>

            <Title level={4}>8. Alteracoes</Title>
            <Paragraph>
              Esta politica pode ser atualizada periodicamente. Alteracoes
              significativas serao comunicadas aos usuarios.
            </Paragraph>
          </Typography>
        </Card>
      </div>
    </div>
  );
}
