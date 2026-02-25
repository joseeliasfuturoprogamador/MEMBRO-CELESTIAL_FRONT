// src/componentes/Batizados.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Grid,
  Text,
  useToast,
  Spinner,
  FormControl,
  FormLabel,
  FormErrorMessage,
  SimpleGrid,
  IconButton,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  InputGroup,
  InputLeftElement,
  VStack,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, SearchIcon } from "@chakra-ui/icons";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Batizados = () => {
  const toast = useToast();

  const [batizados, setBatizados] = useState([]);
  const [nome, setNome] = useState("");
  const [dataBatismo, setDataBatismo] = useState("");
  const [idade, setIdade] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [resumo, setResumo] = useState([]);
  const [searchAno, setSearchAno] = useState({}); // pesquisa por ano

  const idIgreja = sessionStorage.getItem("idIgreja");
  const azul = "blue.600";
  const preto = "gray.800";

  // ===============================
  // VALIDAÇÃO
  // ===============================
  const validar = () => {
    const errs = {};
    if (!nome.trim()) errs.nome = "Nome é obrigatório";
    if (!dataBatismo) errs.dataBatismo = "Data é obrigatória";
    if (!idade || isNaN(idade) || Number(idade) <= 0) errs.idade = "Idade inválida";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ===============================
  // CARREGAR BATIZADOS
  // ===============================
  const loadBatizados = async () => {
    if (!idIgreja) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/batizados`, {
        headers: { "X-Igreja-Id": idIgreja },
      });
      setBatizados(response.data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar batizados",
        description: error.response?.data?.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // CARREGAR RESUMO POR ANO
  // ===============================
  const loadResumo = async () => {
    if (!idIgreja) return;
    try {
      const res = await axios.get(`${API_URL}/api/batizados/resumo/ano`, {
        headers: { "X-Igreja-Id": idIgreja },
      });
      setResumo(res.data || []);
    } catch (err) {
      toast({
        title: "Erro ao carregar resumo por ano",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    loadBatizados();
    loadResumo();
  }, [idIgreja]);

  // ===============================
  // CRIAR / ATUALIZAR
  // ===============================
  const handleSubmit = async () => {
    if (!validar()) {
      toast({
        title: "Verifique os campos",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (editingId) {
        await axios.put(
          `${API_URL}/api/batizados/${editingId}`,
          { nome: nome.trim(), dataBatismo, idade: Number(idade) },
          { headers: { "X-Igreja-Id": idIgreja } }
        );
        toast({ title: "Batizado atualizado", status: "success", duration: 3000, isClosable: true });
        setEditingId(null);
      } else {
        await axios.post(
          `${API_URL}/api/batizados`,
          { nome: nome.trim(), dataBatismo, idade: Number(idade) },
          { headers: { "X-Igreja-Id": idIgreja } }
        );
        toast({ title: "Batizado cadastrado", status: "success", duration: 3000, isClosable: true });
      }

      setNome("");
      setDataBatismo("");
      setIdade("");
      setSearchAno({});
      loadBatizados();
      loadResumo();
    } catch (error) {
      toast({
        title: "Erro ao salvar batizado",
        description: error.response?.data?.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // ===============================
  // EDITAR
  // ===============================
  const handleEdit = (b) => {
    setEditingId(b._id);
    setNome(b.nome);
    setDataBatismo(b.dataBatismo?.slice(0, 10) || "");
    setIdade(b.idade);
  };

  // ===============================
  // DELETAR
  // ===============================
  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente deletar este batizado?")) return;
    try {
      await axios.delete(`${API_URL}/api/batizados/${id}`, { headers: { "X-Igreja-Id": idIgreja } });
      toast({ title: "Batizado deletado", status: "success", duration: 3000, isClosable: true });
      loadBatizados();
      loadResumo();
    } catch (error) {
      toast({
        title: "Erro ao deletar",
        description: error.response?.data?.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // ===============================
  // RENDER
  // ===============================
  return (
    <Box p={6} maxW="1200px" mx="auto" color={preto}>
      <Heading textAlign="center" mb={8} color={azul}>
        Registro de Batizados
      </Heading>

      {/* FORM */}
      <Box bg="white" p={6} rounded="xl" shadow="lg" border="1px solid" borderColor={azul} mb={10}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <FormControl isInvalid={!!errors.nome}>
            <FormLabel>Nome do membro</FormLabel>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
            <FormErrorMessage>{errors.nome}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.dataBatismo}>
            <FormLabel>Data do batismo</FormLabel>
            <Input type="date" value={dataBatismo} onChange={(e) => setDataBatismo(e.target.value)} />
            <FormErrorMessage>{errors.dataBatismo}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.idade}>
            <FormLabel>Idade</FormLabel>
            <Input type="number" value={idade} onChange={(e) => setIdade(e.target.value)} />
            <FormErrorMessage>{errors.idade}</FormErrorMessage>
          </FormControl>
        </SimpleGrid>

        <Flex justify="flex-end" mt={6}>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleSubmit}>
            {editingId ? "Atualizar" : "Cadastrar"}
          </Button>
        </Flex>
      </Box>

      {/* RESUMO POR ANO COM PESQUISA */}
      <Accordion allowToggle>
        {resumo.map((ano) => {
          // filtra batizados daquele ano conforme pesquisa
          const batizadosFiltrados = (ano.batizados || []).filter((b) =>
            b.nome.toLowerCase().includes((searchAno[ano._id] || "").toLowerCase())
          );

          return (
            <AccordionItem key={ano._id}>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="bold">
                  {ano._id} - Total: {batizadosFiltrados.length}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                {/* PESQUISA DENTRO DO ANO */}
                <Box mb={3} w={{ base: "100%", md: "300px" }} position="relative">
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Pesquisar por nome..."
                      value={searchAno[ano._id] || ""}
                      onChange={(e) =>
                        setSearchAno((prev) => ({ ...prev, [ano._id]: e.target.value }))
                      }
                    />
                  </InputGroup>
                </Box>

                <List spacing={3}>
                  {batizadosFiltrados.length === 0 ? (
                    <Text color="gray.500">Nenhum batizado encontrado.</Text>
                  ) : (
                    batizadosFiltrados.map((b) => (
                      <ListItem
                        key={b._id}
                        p={3}
                        bg="gray.50"
                        rounded="md"
                        border="1px solid"
                        borderColor="gray.200"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Text fontWeight="bold">{b.nome}</Text>
                          <Text fontSize="sm">
                            Idade: {b.idade} | Data: {new Date(b.dataBatismo).toLocaleDateString()}
                          </Text>
                        </Box>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => handleEdit(b)}
                            aria-label="Editar"
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDelete(b._id)}
                            aria-label="Deletar"
                          />
                        </HStack>
                      </ListItem>
                    ))
                  )}
                </List>
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Box>
  );
};

export default Batizados;