import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
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

const API_URL = import.meta.env.VITE_API_URL;

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

  const [anoSelecionado, setAnoSelecionado] = useState(
    new Date().getFullYear()
  );

  const [resumoMensal, setResumoMensal] = useState([]);
  const [resumoAnual, setResumoAnual] = useState(0);

  const [filtroCargo, setFiltroCargo] = useState("");
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroMes, setFiltroMes] = useState(null);

  const toast = useToast();

  const igrejaId = sessionStorage.getItem("idIgreja");

  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  // =====================================================
  // CONFIGURAÇÕES
  // =====================================================

  const azul = "blue.600";
  const preto = "gray.800";

  const cargosOrdem = [
    "Pastor",
    "Diácono",
    "Dirigente",
    "Coordenador",
    "Membro comum",
  ];

  const pluralizar = (cargoSelecionado) => {
    switch (cargoSelecionado) {
      case "Pastor":
        return "Pastores";

      case "Diácono":
        return "Diáconos";

      case "Dirigente":
        return "Dirigentes";

      case "Coordenador":
        return "Coordenadores";

      case "Membro comum":
        return "Membros comuns";

      default:
        return `${cargoSelecionado}s`;
    }
  };

  // =====================================================
  // CARREGAR DÍZIMOS
  // =====================================================

  const carregarDizimos = async () => {
    if (!igrejaId || !API_URL) return;

    setLoading(true);

    try {
      const res = await axios.get(
        `${API_URL}/api/dizimos`,
        {
          headers: {
            "X-Igreja-Id": igrejaId,
          },
        }
      );

      setLista(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (error) {
      console.error(
        "Erro ao carregar dízimos:",
        error
      );

      toast({
        title: "Erro ao carregar dízimos",
        description:
          error.response?.data?.message ||
          "Não foi possível carregar os dízimos.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CARREGAR MEMBROS
  // =====================================================

  const carregarMembros = async () => {
    if (!igrejaId || !API_URL) return;

    try {
      const res = await axios.get(
        `${API_URL}/api/users`,
        {
          headers: {
            "X-Igreja-Id": igrejaId,
          },
        }
      );

      setMembros(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (error) {
      console.error(
        "Erro ao carregar membros:",
        error
      );

      toast({
        title: "Erro ao carregar membros",
        description:
          error.response?.data?.message ||
          "Não foi possível carregar os membros.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // =====================================================
  // RESUMO MENSAL
  // =====================================================

  const carregarResumoMensal = async (ano) => {
    if (!igrejaId || !API_URL) return;

    try {
      const res = await axios.get(
        `${API_URL}/api/dizimos/resumo/mensal/${ano}`,
        {
          headers: {
            "X-Igreja-Id": igrejaId,
          },
        }
      );

      setResumoMensal(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (error) {
      console.error(
        "Erro ao carregar resumo mensal:",
        error
      );

      toast({
        title: "Erro ao carregar resumo mensal",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // =====================================================
  // RESUMO ANUAL
  // =====================================================

  const carregarResumoAnual = async (ano) => {
    if (!igrejaId || !API_URL) return;

    try {
      const res = await axios.get(
        `${API_URL}/api/dizimos/resumo/anual/${ano}`,
        {
          headers: {
            "X-Igreja-Id": igrejaId,
          },
        }
      );

      const total =
        typeof res.data === "object"
          ? res.data.total ?? 0
          : res.data ?? 0;

      setResumoAnual(
        Number(total) || 0
      );
    } catch (error) {
      console.error(
        "Erro ao carregar resumo anual:",
        error
      );

      toast({
        title: "Erro ao carregar resumo anual",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

      setResumoAnual(0);
    }
  };

  // =====================================================
  // CARREGAMENTO INICIAL
  // =====================================================

  useEffect(() => {
    carregarDizimos();
    carregarMembros();
    carregarResumoMensal(anoSelecionado);
    carregarResumoAnual(anoSelecionado);

    setFiltroMes(null);
  }, [
    igrejaId,
    anoSelecionado,
  ]);

  // =====================================================
  // VALIDAÇÃO
  // =====================================================

  const validar = () => {
    const errs = {};

    const membroExiste = membros.some(
      (m) =>
        typeof m.nome === "string" &&
        m.nome.toLowerCase() ===
          membro.trim().toLowerCase()
    );

    if (!membro.trim()) {
      errs.membro =
        "Nome do dizimista é obrigatório";
    } else if (!membroExiste) {
      errs.membro =
        "Membro não encontrado. Cadastre-o primeiro.";
    }

    if (
      !valor ||
      isNaN(valor) ||
      parseFloat(valor) <= 0
    ) {
      errs.valor =
        "Valor deve ser maior que zero";
    }

    if (!cargo.trim()) {
      errs.cargo =
        "Cargo é obrigatório";
    }

    setErrors(errs);

    return (
      Object.keys(errs).length === 0
    );
  };

  // =====================================================
  // SALVAR DÍZIMO
  // =====================================================

  const handleSalvar = async () => {
    if (!validar()) {
      toast({
        title: "Erro ao salvar",
        description:
          "Verifique os campos obrigatórios",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });

      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/dizimos`,
        {
          membro: membro.trim(),
          valor: parseFloat(valor),
          data: new Date().toISOString(),
          descricao:
            descricao.trim() || undefined,
          cargo: cargo.trim(),
        },
        {
          headers: {
            "X-Igreja-Id": igrejaId,
          },
        }
      );

      setMembro("");
      setValor("");
      setDescricao("");
      setCargo("");
      setSugestoes([]);
      setErrors({});

      toast({
        title:
          "Dízimo registrado com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await carregarDizimos();
      await carregarResumoMensal(
        anoSelecionado
      );
      await carregarResumoAnual(
        anoSelecionado
      );

      setFiltroCargo("");
      setFiltroNome("");
      setFiltroMes(null);
    } catch (error) {
      console.error(
        "Erro ao registrar dízimo:",
        error
      );

      toast({
        title:
          "Erro ao registrar dízimo",
        description:
          error.response?.data?.message ||
          error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // =====================================================
  // BUSCAR MEMBRO
  // =====================================================

  const handleMembroChange = (e) => {
    const valorDigitado =
      e.target.value;

    setMembro(valorDigitado);

    if (!valorDigitado.trim()) {
      setSugestoes([]);
      return;
    }

    const filtro = membros
      .filter(
        (m) =>
          typeof m.nome === "string" &&
          m.nome
            .toLowerCase()
            .includes(
              valorDigitado.toLowerCase()
            )
      )
      .map((m) => m.nome);

    setSugestoes(
      filtro.slice(0, 5)
    );
  };

  const selecionarSugestao = (
    nome
  ) => {
    setMembro(nome);
    setSugestoes([]);
    setErrors((prev) => ({
      ...prev,
      membro: "",
    }));
  };

  // =====================================================
  // EXCLUSÃO
  // =====================================================

  const abrirModalDeletar = (id) => {
    setIdParaDeletar(id);
    onOpen();
  };

  const confirmarDeletar = async () => {
    if (!idParaDeletar) return;

    try {
      await axios.delete(
        `${API_URL}/api/dizimos/${idParaDeletar}`,
        {
          headers: {
            "X-Igreja-Id": igrejaId,
          },
        }
      );

      toast({
        title:
          "Dízimo deletado com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await carregarDizimos();
      await carregarResumoMensal(
        anoSelecionado
      );
      await carregarResumoAnual(
        anoSelecionado
      );

      setFiltroCargo("");
      setFiltroNome("");
      setFiltroMes(null);
    } catch (error) {
      console.error(
        "Erro ao deletar dízimo:",
        error
      );

      toast({
        title:
          "Erro ao deletar dízimo",
        description:
          error.response?.data?.message ||
          error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    onClose();
    setIdParaDeletar(null);
  };

  // =====================================================
  // FILTRAR DÍZIMOS
  // =====================================================

  const dizimosFiltrados =
    lista.filter((d) => {
      const filtroCargoOk = filtroCargo
        ? d.cargo === filtroCargo
        : true;

      const filtroNomeOk = filtroNome
        ? d.membro
            ?.toLowerCase()
            .includes(
              filtroNome.toLowerCase()
            )
        : true;

      const filtroMesOk = filtroMes
        ? new Date(d.data).getMonth() +
            1 ===
          filtroMes
        : true;

      return (
        filtroCargoOk &&
        filtroNomeOk &&
        filtroMesOk
      );
    });

  // =====================================================
  // TELA
  // =====================================================

  return (
    <Box
      w="100%"
      minH="100vh"
      px={{
        base: 3,
        sm: 4,
        md: 6,
      }}
      py={{
        base: 4,
        md: 8,
      }}
      color={preto}
      overflowX="hidden"
    >
      <Box
        w="100%"
        maxW="1200px"
        mx="auto"
      >

        {/* ================================================= */}
        {/* TÍTULO */}
        {/* ================================================= */}

        <Heading
          textAlign="center"
          mb={{
            base: 5,
            md: 8,
          }}
          fontWeight="bold"
          color={azul}
          fontSize={{
            base: "2xl",
            sm: "3xl",
            md: "4xl",
          }}
        >
          Registro de Dízimos
        </Heading>

        {/* ================================================= */}
        {/* FORMULÁRIO */}
        {/* ================================================= */}

        <Box
          bg="white"
          p={{
            base: 4,
            sm: 5,
            md: 8,
          }}
          rounded="xl"
          shadow="lg"
          border="1px solid"
          borderColor={azul}
          mb={{
            base: 6,
            md: 10,
          }}
        >
          <Heading
            fontSize={{
              base: "lg",
              md: "xl",
            }}
            color={azul}
            mb={5}
          >
            Registrar novo dízimo
          </Heading>

          <SimpleGrid
            columns={{
              base: 1,
              md: 2,
            }}
            spacing={{
              base: 4,
              md: 6,
            }}
          >

            {/* MEMBRO */}

            <FormControl
              isInvalid={
                !!errors.membro
              }
            >
              <FormLabel
                fontSize={{
                  base: "sm",
                  md: "md",
                }}
                fontWeight="bold"
              >
                Nome do Dizimista
              </FormLabel>

              <Input
                h="46px"
                value={membro}
                onChange={
                  handleMembroChange
                }
                placeholder="Digite o nome"
                autoComplete="off"
              />

              {sugestoes.length > 0 && (
                <List
                  mt={2}
                  spacing={1}
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={2}
                  maxH="180px"
                  overflowY="auto"
                  cursor="pointer"
                  position="relative"
                  zIndex={20}
                  boxShadow="md"
                >
                  {sugestoes.map(
                    (s, i) => (
                      <ListItem
                        key={i}
                        onClick={() =>
                          selecionarSugestao(
                            s
                          )
                        }
                        _hover={{
                          bg: azul,
                          color:
                            "white",
                        }}
                        px={3}
                        py={2}
                        borderRadius="md"
                        fontSize={{
                          base: "sm",
                          md: "md",
                        }}
                      >
                        {s}
                      </ListItem>
                    )
                  )}
                </List>
              )}

              <FormErrorMessage>
                {errors.membro}
              </FormErrorMessage>
            </FormControl>

            {/* VALOR */}

            <FormControl
              isInvalid={
                !!errors.valor
              }
            >
              <FormLabel
                fontSize={{
                  base: "sm",
                  md: "md",
                }}
                fontWeight="bold"
              >
                Valor (R$)
              </FormLabel>

              <Input
                h="46px"
                type="number"
                inputMode="decimal"
                value={valor}
                onChange={(e) =>
                  setValor(
                    e.target.value
                  )
                }
                placeholder="0,00"
                min="0"
                step="0.01"
              />

              <FormErrorMessage>
                {errors.valor}
              </FormErrorMessage>
            </FormControl>

            {/* CARGO */}

            <FormControl
              isInvalid={
                !!errors.cargo
              }
            >
              <FormLabel
                fontSize={{
                  base: "sm",
                  md: "md",
                }}
                fontWeight="bold"
              >
                Cargo
              </FormLabel>

              <Select
                h="46px"
                value={cargo}
                onChange={(e) =>
                  setCargo(
                    e.target.value
                  )
                }
                placeholder="Selecione o cargo"
              >
                {cargosOrdem.map(
                  (c) => (
                    <option
                      key={c}
                      value={c}
                    >
                      {c}
                    </option>
                  )
                )}
              </Select>

              <FormErrorMessage>
                {errors.cargo}
              </FormErrorMessage>
            </FormControl>

            {/* DESCRIÇÃO */}

            <FormControl>
              <FormLabel
                fontSize={{
                  base: "sm",
                  md: "md",
                }}
                fontWeight="bold"
              >
                Descrição
                <Text
                  as="span"
                  fontSize="xs"
                  color="gray.500"
                  ml={1}
                >
                  (opcional)
                </Text>
              </FormLabel>

              <Input
                h="46px"
                value={descricao}
                onChange={(e) =>
                  setDescricao(
                    e.target.value
                  )
                }
                placeholder="Ex.: Dízimo mensal"
              />
            </FormControl>

          </SimpleGrid>

          {/* BOTÃO SALVAR */}

          <Flex
            justify={{
              base: "stretch",
              md: "flex-end",
            }}
            mt={6}
          >
            <Button
              colorScheme="blue"
              onClick={handleSalvar}
              size="lg"
              w={{
                base: "100%",
                md: "auto",
              }}
              minH="48px"
            >
              Salvar Dízimo
            </Button>
          </Flex>
        </Box>

        {/* ================================================= */}
        {/* FILTROS */}
        {/* ================================================= */}

        <Box
          bg="white"
          p={{
            base: 4,
            sm: 5,
            md: 6,
          }}
          rounded="xl"
          shadow="lg"
          border="1px solid"
          borderColor={azul}
          mb={{
            base: 6,
            md: 8,
          }}
        >
          <Heading
            fontSize={{
              base: "xl",
              md: "2xl",
            }}
            mb={5}
            color={azul}
            textAlign="center"
          >
            Dízimos e Cargos
          </Heading>

          <SimpleGrid
            columns={{
              base: 1,
              sm: 2,
              md: 3,
              lg: 6,
            }}
            spacing={2}
          >
            <Button
              colorScheme={
                filtroCargo === ""
                  ? "blue"
                  : "gray"
              }
              onClick={() =>
                setFiltroCargo("")
              }
              minH="44px"
              w="100%"
            >
              Todos
            </Button>

            {cargosOrdem.map(
              (c) => (
                <Button
                  key={c}
                  colorScheme={
                    filtroCargo === c
                      ? "blue"
                      : "gray"
                  }
                  onClick={() =>
                    setFiltroCargo(c)
                  }
                  minH="44px"
                  w="100%"
                  whiteSpace="normal"
                  fontSize="sm"
                >
                  {pluralizar(c)}
                </Button>
              )
            )}
          </SimpleGrid>

          {/* BUSCA POR NOME */}

          <Box
            mt={5}
            w="100%"
            maxW="500px"
            mx="auto"
          >
            <Input
              h="46px"
              placeholder="Buscar dizimista pelo nome..."
              value={filtroNome}
              onChange={(e) =>
                setFiltroNome(
                  e.target.value
                )
              }
              autoComplete="off"
            />
          </Box>
        </Box>

        {/* ================================================= */}
        {/* LISTA DE DÍZIMOS */}
        {/* ================================================= */}

        <Box
          mb={{
            base: 8,
            md: 12,
          }}
        >
          {loading ? (
            <Flex
              justify="center"
              align="center"
              minH="180px"
            >
              <Spinner
                size="xl"
                color={azul}
              />
            </Flex>
          ) : dizimosFiltrados.length ===
            0 ? (
            <Box
              bg="white"
              p={{
                base: 8,
                md: 10,
              }}
              borderRadius="xl"
              textAlign="center"
              boxShadow="sm"
            >
              <Text
                fontSize={{
                  base: "sm",
                  md: "lg",
                }}
                color="gray.500"
                fontWeight="bold"
              >
                Nenhum dízimo encontrado
                para os filtros
                selecionados.
              </Text>
            </Box>
          ) : (
            <SimpleGrid
              columns={{
                base: 1,
                sm: 2,
                lg: 3,
              }}
              spacing={{
                base: 4,
                md: 6,
              }}
            >
              {dizimosFiltrados.map(
                ({
                  _id,
                  membro,
                  valor,
                  descricao,
                  data,
                  cargo,
                }) => (
                  <Box
                    key={_id}
                    bg="white"
                    p={{
                      base: 4,
                      md: 6,
                    }}
                    rounded="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor={azul}
                    minW={0}
                    transition="all 0.2s"
                    _hover={{
                      shadow: "lg",
                      transform:
                        "translateY(-2px)",
                    }}
                  >

                    {/* MEMBRO */}

                    <Text
                      fontWeight="bold"
                      fontSize={{
                        base: "md",
                        md: "lg",
                      }}
                      color={azul}
                      wordBreak="break-word"
                    >
                      {membro}
                    </Text>

                    {/* CARGO */}

                    <Text
                      fontSize="sm"
                      color="gray.600"
                      mt={1}
                    >
                      {cargo}
                    </Text>

                    {/* VALOR */}

                    <Text
                      color={azul}
                      fontWeight="bold"
                      fontSize={{
                        base: "xl",
                        md: "2xl",
                      }}
                      mt={3}
                      mb={2}
                    >
                      R${" "}
                      {parseFloat(
                        valor || 0
                      ).toFixed(2)}
                    </Text>

                    {/* DESCRIÇÃO */}

                    {descricao && (
                      <Text
                        mb={2}
                        color="gray.700"
                        fontSize="sm"
                        wordBreak="break-word"
                      >
                        {descricao}
                      </Text>
                    )}

                    {/* DATA */}

                    <Text
                      fontSize="sm"
                      color="gray.500"
                      mb={4}
                    >
                      {new Date(
                        data
                      ).toLocaleDateString()}
                    </Text>

                    {/* BOTÃO */}

                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() =>
                        abrirModalDeletar(
                          _id
                        )
                      }
                      w={{
                        base: "100%",
                        sm: "auto",
                      }}
                      minH="42px"
                    >
                      Deletar
                    </Button>

                  </Box>
                )
              )}
            </SimpleGrid>
          )}
        </Box>

        {/* ================================================= */}
        {/* BALANÇO FINANCEIRO */}
        {/* ================================================= */}

        <Box
          bg="white"
          p={{
            base: 4,
            sm: 5,
            md: 6,
          }}
          rounded="xl"
          shadow="lg"
          border="1px solid"
          borderColor={azul}
          mb={8}
        >
          <Heading
            fontSize={{
              base: "xl",
              md: "2xl",
            }}
            mb={6}
            color={azul}
            textAlign="center"
          >
            Balanço Financeiro
          </Heading>

          {/* ANO */}

          <FormControl
            w="100%"
            maxW="220px"
            mb={7}
            mx="auto"
          >
            <FormLabel
              fontWeight="bold"
              textAlign="center"
            >
              Ano
            </FormLabel>

            <Select
              h="46px"
              value={anoSelecionado}
              onChange={(e) =>
                setAnoSelecionado(
                  parseInt(
                    e.target.value
                  )
                )
              }
            >
              {Array.from({
                length: 5,
              }).map((_, i) => {
                const ano =
                  new Date().getFullYear() -
                  i;

                return (
                  <option
                    key={ano}
                    value={ano}
                  >
                    {ano}
                  </option>
                );
              })}
            </Select>
          </FormControl>

          {/* RESUMO MENSAL */}

          <Heading
            fontSize={{
              base: "lg",
              md: "xl",
            }}
            mb={4}
            color={preto}
            textAlign={{
              base: "center",
              md: "left",
            }}
          >
            Resumo Mensal
          </Heading>

          <SimpleGrid
            columns={{
              base: 1,
              sm: 2,
              md: 3,
              lg: 4,
            }}
            spacing={2}
            mb={6}
          >
            {resumoMensal.map(
              ({
                mes,
                entrada = 0,
                saida = 0,
              }) => {
                const total =
                  entrada - saida;

                return (
                  <Button
                    key={mes}
                    colorScheme={
                      filtroMes === mes
                        ? "blue"
                        : "gray"
                    }
                    onClick={() =>
                      setFiltroMes(
                        filtroMes === mes
                          ? null
                          : mes
                      )
                    }
                    size="sm"
                    minH="44px"
                    w="100%"
                    whiteSpace="normal"
                    fontSize="xs"
                  >
                    {`Mês ${mes} - R$ ${total.toFixed(
                      2
                    )}`}
                  </Button>
                );
              }
            )}

            {filtroMes && (
              <Button
                colorScheme="red"
                onClick={() =>
                  setFiltroMes(null)
                }
                size="sm"
                minH="44px"
                w="100%"
              >
                Limpar filtro
              </Button>
            )}
          </SimpleGrid>

          <Divider mb={6} />

          {/* RESUMO ANUAL */}

          <Heading
            fontSize={{
              base: "lg",
              md: "xl",
            }}
            mb={4}
            color={preto}
            textAlign="center"
          >
            Resumo Anual
          </Heading>

          <Box
            bg="blue.50"
            borderRadius="xl"
            py={{
              base: 5,
              md: 6,
            }}
            px={4}
            textAlign="center"
          >
            <Text
              fontSize={{
                base: "2xl",
                sm: "3xl",
                md: "4xl",
              }}
              fontWeight="bold"
              color={azul}
              wordBreak="break-word"
            >
              R${" "}
              {(resumoAnual || 0).toFixed(
                2
              )}
            </Text>
          </Box>
        </Box>

      </Box>

      {/* ================================================= */}
      {/* MODAL DE EXCLUSÃO */}
      {/* ================================================= */}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        size={{
          base: "xs",
          sm: "md",
        }}
      >
        <ModalOverlay />

        <ModalContent
          mx={{
            base: 3,
            sm: 0,
          }}
        >
          <ModalHeader
            fontSize={{
              base: "lg",
              md: "xl",
            }}
          >
            Confirmar exclusão
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody>
            <Text
              fontSize={{
                base: "sm",
                md: "md",
              }}
            >
              Tem certeza que deseja
              deletar esse dízimo?
            </Text>
          </ModalBody>

          <ModalFooter
            gap={2}
            flexDirection={{
              base: "column-reverse",
              sm: "row",
            }}
          >
            <Button
              variant="ghost"
              onClick={onClose}
              w={{
                base: "100%",
                sm: "auto",
              }}
            >
              Cancelar
            </Button>

            <Button
              colorScheme="red"
              onClick={
                confirmarDeletar
              }
              w={{
                base: "100%",
                sm: "auto",
              }}
            >
              Deletar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Dizimos;