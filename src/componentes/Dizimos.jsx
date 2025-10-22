import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Spinner,
  Stack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  List,
  ListItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  SimpleGrid,
  Divider,
  Select,
} from "@chakra-ui/react";
import axios from "axios";

const Dizimos = () => {
  const [valor, setValor] = useState("");
  const [membro, setMembro] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cargo, setCargo] = useState("");
  const [lista, setLista] = useState([]);
  const [membros, setMembros] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [idParaDeletar, setIdParaDeletar] = useState(null);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [resumoMensal, setResumoMensal] = useState([]);
  const [resumoAnual, setResumoAnual] = useState(0);

  const [filtroCargo, setFiltroCargo] = useState("");
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroMes, setFiltroMes] = useState(null);

  const toast = useToast();
  const igrejaId = sessionStorage.getItem("idIgreja");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const pluralizar = (cargo) => {
    switch (cargo) {
      case "Pastor": return "Pastores";
      case "Diácono": return "Diáconos";
      case "Dirigente": return "Dirigentes";
      case "Coordenador": return "Coordenadores";
      case "Membro comum": return "Membros comuns";
      default: return cargo + "s";
    }
  };

  const cargosOrdem = [
    "Pastor",
    "Diácono",
    "Dirigente",
    "Coordenador",
    "Membro comum",
  ];

  // Carregar dízimos do backend
  const carregarDizimos = async () => {
    if (!igrejaId) return;
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/dizimos", {
        headers: { "X-Igreja-Id": igrejaId },
      });
      setLista(res.data);
    } catch {
      toast({
        title: "Erro ao carregar dízimos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar membros para sugestões e validação
  const carregarMembros = async () => {
    if (!igrejaId) return;
    try {
      const res = await axios.get("http://localhost:3000/api/users", {
        headers: { "X-Igreja-Id": igrejaId },
      });
      setMembros(res.data);
    } catch {
      toast({
        title: "Erro ao carregar membros",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Resumo mensal
  const carregarResumoMensal = async (ano) => {
    if (!igrejaId) return;
    try {
      const res = await axios.get(
        `http://localhost:3000/api/dizimos/resumo/mensal/${ano}`,
        { headers: { "X-Igreja-Id": igrejaId } }
      );
      setResumoMensal(res.data);
    } catch {
      toast({
        title: "Erro ao carregar resumo mensal",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Resumo anual
  const carregarResumoAnual = async (ano) => {
    if (!igrejaId) return;
    try {
      const res = await axios.get(
        `http://localhost:3000/api/dizimos/resumo/anual/${ano}`,
        { headers: { "X-Igreja-Id": igrejaId } }
      );
      const total = typeof res.data === "object" ? res.data.total ?? 0 : res.data ?? 0;
      setResumoAnual(total);
    } catch {
      toast({
        title: "Erro ao carregar resumo anual",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setResumoAnual(0);
    }
  };

  useEffect(() => {
    carregarDizimos();
    carregarMembros();
    carregarResumoMensal(anoSelecionado);
    carregarResumoAnual(anoSelecionado);
    setFiltroMes(null);
  }, [igrejaId, anoSelecionado]);

  const validar = () => {
    const errs = {};
    const membroExiste = membros.some(
      (m) => m.nome.toLowerCase() === membro.trim().toLowerCase()
    );
    if (!membro.trim()) errs.membro = "Nome do dizimista é obrigatório";
    else if (!membroExiste) errs.membro = "Membro não encontrado. Cadastre-o primeiro.";
    if (!valor || isNaN(valor) || parseFloat(valor) <= 0)
      errs.valor = "Valor deve ser maior que zero";
    if (!cargo.trim()) errs.cargo = "Cargo é obrigatório";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSalvar = async () => {
    if (!validar()) {
      toast({
        title: "Erro ao salvar",
        description: "Verifique os campos obrigatórios",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      await axios.post(
        "http://localhost:3000/api/dizimos",
        {
          membro: membro.trim(),
          valor: parseFloat(valor),
          data: new Date().toISOString(),
          descricao: descricao.trim() || undefined,
          cargo: cargo.trim(),
        },
        { headers: { "X-Igreja-Id": igrejaId } }
      );

      setMembro("");
      setValor("");
      setDescricao("");
      setCargo("");
      toast({
        title: "Dízimo registrado com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      carregarDizimos();
      carregarResumoMensal(anoSelecionado);
      carregarResumoAnual(anoSelecionado);
      setFiltroCargo("");
      setFiltroNome("");
      setFiltroMes(null);
    } catch (error) {
      toast({
        title: "Erro ao registrar dízimo",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleMembroChange = (e) => {
    const valor = e.target.value;
    setMembro(valor);
    const filtro = membros
      .filter((m) => m.nome.toLowerCase().includes(valor.toLowerCase()))
      .map((m) => m.nome);
    setSugestoes(filtro.slice(0, 5));
  };

  const selecionarSugestao = (nome) => {
    setMembro(nome);
    setSugestoes([]);
  };

  const abrirModalDeletar = (id) => {
    setIdParaDeletar(id);
    onOpen();
  };

  const confirmarDeletar = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/dizimos/${idParaDeletar}`, {
        headers: { "X-Igreja-Id": igrejaId },
      });
      toast({
        title: "Dízimo deletado com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      carregarDizimos();
      carregarResumoMensal(anoSelecionado);
      carregarResumoAnual(anoSelecionado);
      setFiltroCargo("");
      setFiltroNome("");
      setFiltroMes(null);
    } catch (error) {
      toast({
        title: "Erro ao deletar dízimo",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    onClose();
    setIdParaDeletar(null);
  };

  const dizimosFiltrados = lista.filter((d) => {
    const filtroCargoOk = filtroCargo ? d.cargo === filtroCargo : true;
    const filtroNomeOk = filtroNome ? d.membro.toLowerCase().includes(filtroNome.toLowerCase()) : true;
    const filtroMesOk = filtroMes ? new Date(d.data).getMonth() + 1 === filtroMes : true;
    return filtroCargoOk && filtroNomeOk && filtroMesOk;
  });

  const azul = "blue.600";
  const preto = "gray.800";

  return (
    <Box p={6} maxW="1200px" mx="auto" color={preto}>
      <Heading textAlign="center" mb={8} fontWeight="bold" color={azul} fontSize="4xl">
        Registro de Dízimos
      </Heading>

      {/* Formulário */}
      <Box bg="white" p={8} rounded="xl" shadow="lg" border="1px solid" borderColor={azul} mb={12}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl isInvalid={!!errors.membro}>
            <FormLabel>Nome do Dizimista</FormLabel>
            <Input value={membro} onChange={handleMembroChange} placeholder="Digite o nome" />
            {sugestoes.length > 0 && (
              <List mt={2} spacing={1} bg="gray.100" borderRadius="md" p={2} maxH="150px" overflowY="auto" cursor="pointer">
                {sugestoes.map((s, i) => (
                  <ListItem key={i} onClick={() => selecionarSugestao(s)} _hover={{ bg: azul, color: "white" }} px={2} py={1}>
                    {s}
                  </ListItem>
                ))}
              </List>
            )}
            <FormErrorMessage>{errors.membro}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.valor}>
            <FormLabel>Valor (R$)</FormLabel>
            <Input type="number" value={valor} onChange={(e) => setValor(e.target.value)} />
            <FormErrorMessage>{errors.valor}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.cargo}>
            <FormLabel>Cargo</FormLabel>
            <Select placeholder="Selecione o cargo" value={cargo} onChange={(e) => setCargo(e.target.value)}>
              {cargosOrdem.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.cargo}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>Descrição (opcional)</FormLabel>
            <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </FormControl>
        </SimpleGrid>
        <Flex justify="flex-end" mt={6}>
          <Button colorScheme="blue" onClick={handleSalvar} size="lg">
            Salvar
          </Button>
        </Flex>
      </Box>

      {/* Filtros e botões por cargo */}
      <Box bg="white" p={6} rounded="xl" shadow="lg" border="1px solid" borderColor={azul} mb={8}>
        <Heading fontSize="2xl" mb={4} color={azul} textAlign="center">
          Dízimos e Cargos
        </Heading>
        <Stack direction={{ base: "column", md: "row" }} spacing={3} justify="center" flexWrap="wrap">
          <Button colorScheme={filtroCargo === "" ? "blue" : "gray"} onClick={() => setFiltroCargo("")}>
            Todos
          </Button>
          {cargosOrdem.map((c) => (
            <Button key={c} colorScheme={filtroCargo === c ? "blue" : "gray"} onClick={() => setFiltroCargo(c)}>
              {pluralizar(c)}
            </Button>
          ))}
        </Stack>

        <Box mt={4} maxW="400px" mx="auto">
          <Input placeholder="Buscar dizimista pelo nome..." value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)} autoComplete="off" />
        </Box>
      </Box>

      {/* Lista filtrada */}
      <Box mb={12}>
        {loading ? (
          <Flex justify="center" align="center" minH="150px">
            <Spinner size="xl" color={azul} />
          </Flex>
        ) : dizimosFiltrados.length === 0 ? (
          <Text textAlign="center" fontSize="lg" color="gray.500">
            Nenhum dízimo encontrado para os filtros selecionados.
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {dizimosFiltrados.map(({ _id, membro, valor, descricao, data, cargo }) => (
              <Box key={_id} bg="white" p={6} rounded="xl" shadow="md" border="1px solid" borderColor={azul}>
                <Heading fontSize="lg" mb={2} color={azul}>
                  {membro} <Text as="span" fontSize="sm" color="gray.600">({cargo})</Text>
                </Heading>
                <Text color={azul} fontWeight="bold" fontSize="xl" mb={2}>
                  R$ {parseFloat(valor || 0).toFixed(2)}
                </Text>
                {descricao && <Text mb={2}>{descricao}</Text>}
                <Text fontSize="sm" color="gray.500" mb={4}>
                  {new Date(data).toLocaleDateString()}
                </Text>
                <Button colorScheme="red" size="sm" onClick={() => abrirModalDeletar(_id)}>
                  Deletar
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Resumo Financeiro */}
      <Box bg="white" p={6} rounded="xl" shadow="lg" border="1px solid" borderColor={azul}>
        <Heading fontSize="2xl" mb={6} color={azul} textAlign="center">
          Balanço Financeiro
        </Heading>
        <FormControl maxW="200px" mb={6} mx="auto">
          <FormLabel>Ano</FormLabel>
          <Select value={anoSelecionado} onChange={(e) => setAnoSelecionado(parseInt(e.target.value))}>
            {Array.from({ length: 5 }).map((_, i) => {
              const ano = new Date().getFullYear() - i;
              return (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              );
            })}
          </Select>
        </FormControl>

        <Heading fontSize="xl" mb={4} color={preto}>
          Resumo Mensal
        </Heading>

        <Stack direction="row" wrap="wrap" spacing={2} justify="center" mb={6}>
          {resumoMensal.map(({ mes, entrada = 0, saida = 0 }) => {
            const total = entrada - saida;
            return (
              <Button
                key={mes}
                colorScheme={filtroMes === mes ? "blue" : "gray"}
                onClick={() => setFiltroMes(filtroMes === mes ? null : mes)}
                size="sm"
                minW="80px"
              >
                {`Mês ${mes} - R$ ${total.toFixed(2)}`}
              </Button>
            );
          })}
          {filtroMes && (
            <Button colorScheme="red" onClick={() => setFiltroMes(null)} size="sm" ml={4}>
              Limpar filtro
            </Button>
          )}
        </Stack>

        <Divider mb={6} />

        <Heading fontSize="xl" mb={4} color={preto} textAlign="center">
          Resumo Anual
        </Heading>
        <Text fontSize="2xl" fontWeight="bold" textAlign="center" color={azul}>
          R$ {(resumoAnual || 0).toFixed(2)}
        </Text>
      </Box>

      {/* Modal de confirmação de exclusão */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar exclusão</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Tem certeza que deseja deletar esse dízimo?</ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={confirmarDeletar}>
              Deletar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Dizimos;
