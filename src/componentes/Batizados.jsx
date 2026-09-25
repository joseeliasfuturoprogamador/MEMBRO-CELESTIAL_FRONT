import { useEffect, useState } from "react";
import axios from "axios";

import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  useToast,
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

import {
  AddIcon,
  DeleteIcon,
  EditIcon,
  SearchIcon,
} from "@chakra-ui/icons";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

const Batizados = () => {
  const toast = useToast();

  const [batizados, setBatizados] = useState([]);
  const [nome, setNome] = useState("");
  const [dataBatismo, setDataBatismo] =
    useState("");
  const [idade, setIdade] = useState("");
  const [loading, setLoading] =
    useState(false);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] =
    useState(null);
  const [resumo, setResumo] = useState([]);
  const [searchAno, setSearchAno] =
    useState({});

  const idIgreja =
    sessionStorage.getItem("idIgreja");

  const azul = "blue.600";
  const preto = "gray.800";

  // =====================================================
  // VALIDAÇÃO
  // =====================================================

  const validar = () => {
    const errs = {};

    if (!nome.trim()) {
      errs.nome = "Nome é obrigatório";
    }

    if (!dataBatismo) {
      errs.dataBatismo =
        "Data é obrigatória";
    }

    if (
      !idade ||
      isNaN(idade) ||
      Number(idade) <= 0
    ) {
      errs.idade = "Idade inválida";
    }

    setErrors(errs);

    return (
      Object.keys(errs).length === 0
    );
  };

  // =====================================================
  // CARREGAR BATIZADOS
  // =====================================================

  const loadBatizados = async () => {
    if (!idIgreja) return;

    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/api/batizados`,
        {
          headers: {
            "X-Igreja-Id": idIgreja,
          },
        }
      );

      setBatizados(
        response.data || []
      );
    } catch (error) {
      toast({
        title:
          "Erro ao carregar batizados",
        description:
          error.response?.data?.message ||
          "Não foi possível carregar os batizados.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CARREGAR RESUMO POR ANO
  // =====================================================

  const loadResumo = async () => {
    if (!idIgreja) return;

    try {
      const res = await axios.get(
        `${API_URL}/api/batizados/resumo/ano`,
        {
          headers: {
            "X-Igreja-Id": idIgreja,
          },
        }
      );

      setResumo(res.data || []);
    } catch (err) {
      toast({
        title:
          "Erro ao carregar resumo por ano",
        description:
          err.response?.data?.message ||
          err.message,
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

  // =====================================================
  // CRIAR / ATUALIZAR
  // =====================================================

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
          {
            nome: nome.trim(),
            dataBatismo,
            idade: Number(idade),
          },
          {
            headers: {
              "X-Igreja-Id": idIgreja,
            },
          }
        );

        toast({
          title: "Batizado atualizado",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setEditingId(null);
      } else {
        await axios.post(
          `${API_URL}/api/batizados`,
          {
            nome: nome.trim(),
            dataBatismo,
            idade: Number(idade),
          },
          {
            headers: {
              "X-Igreja-Id": idIgreja,
            },
          }
        );

        toast({
          title: "Batizado cadastrado",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      setNome("");
      setDataBatismo("");
      setIdade("");
      setErrors({});
      setSearchAno({});

      await loadBatizados();
      await loadResumo();
    } catch (error) {
      toast({
        title: "Erro ao salvar batizado",
        description:
          error.response?.data?.message ||
          "Não foi possível salvar o batizado.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // =====================================================
  // EDITAR
  // =====================================================

  const handleEdit = (b) => {
    setEditingId(b._id);
    setNome(b.nome);

    setDataBatismo(
      b.dataBatismo?.slice(0, 10) ||
        ""
    );

    setIdade(b.idade);

    setErrors({});

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETAR
  // =====================================================

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Deseja realmente deletar este batizado?"
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/batizados/${id}`,
        {
          headers: {
            "X-Igreja-Id": idIgreja,
          },
        }
      );

      toast({
        title: "Batizado deletado",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await loadBatizados();
      await loadResumo();
    } catch (error) {
      toast({
        title: "Erro ao deletar",
        description:
          error.response?.data?.message ||
          "Não foi possível deletar o batizado.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Box
      w="100%"
      maxW="1200px"
      mx="auto"
      px={{
        base: 3,
        sm: 4,
        md: 6,
      }}
      py={{
        base: 4,
        md: 6,
      }}
      color={preto}
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
        color={azul}
        fontSize={{
          base: "2xl",
          sm: "3xl",
          md: "4xl",
        }}
        lineHeight="1.2"
      >
        Registro de Batizados
      </Heading>

      {/* ================================================= */}
      {/* FORMULÁRIO */}
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
          md: 10,
        }}
        w="100%"
      >

        <SimpleGrid
          columns={{
            base: 1,
            md: 3,
          }}
          spacing={{
            base: 4,
            md: 5,
          }}
        >

          {/* NOME */}

          <FormControl
            isInvalid={!!errors.nome}
          >
            <FormLabel
              fontSize={{
                base: "sm",
                md: "md",
              }}
            >
              Nome do membro
            </FormLabel>

            <Input
              size="md"
              value={nome}
              placeholder="Digite o nome"
              onChange={(e) =>
                setNome(
                  e.target.value
                )
              }
            />

            <FormErrorMessage>
              {errors.nome}
            </FormErrorMessage>
          </FormControl>

          {/* DATA */}

          <FormControl
            isInvalid={
              !!errors.dataBatismo
            }
          >
            <FormLabel
              fontSize={{
                base: "sm",
                md: "md",
              }}
            >
              Data do batismo
            </FormLabel>

            <Input
              size="md"
              type="date"
              value={dataBatismo}
              onChange={(e) =>
                setDataBatismo(
                  e.target.value
                )
              }
            />

            <FormErrorMessage>
              {errors.dataBatismo}
            </FormErrorMessage>
          </FormControl>

          {/* IDADE */}

          <FormControl
            isInvalid={!!errors.idade}
          >
            <FormLabel
              fontSize={{
                base: "sm",
                md: "md",
              }}
            >
              Idade
            </FormLabel>

            <Input
              size="md"
              type="number"
              min="1"
              value={idade}
              placeholder="Digite a idade"
              onChange={(e) =>
                setIdade(
                  e.target.value
                )
              }
            />

            <FormErrorMessage>
              {errors.idade}
            </FormErrorMessage>
          </FormControl>

        </SimpleGrid>

        {/* BOTÃO */}

        <Flex
          justify={{
            base: "stretch",
            sm: "flex-end",
          }}
          mt={6}
        >
          <Button
            leftIcon={
              editingId ? (
                <EditIcon />
              ) : (
                <AddIcon />
              )
            }
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Salvando..."
            w={{
              base: "100%",
              sm: "auto",
            }}
            minH="46px"
          >
            {editingId
              ? "Atualizar"
              : "Cadastrar"}
          </Button>
        </Flex>

      </Box>

      {/* ================================================= */}
      {/* RESUMO POR ANO */}
      {/* ================================================= */}

      <Box
        w="100%"
        bg="white"
        borderRadius="xl"
        boxShadow="md"
        p={{
          base: 2,
          sm: 3,
          md: 4,
        }}
      >

        <Accordion
          allowToggle
          allowMultiple={false}
        >

          {resumo.map((ano) => {

            const batizadosFiltrados =
              (
                ano.batizados || []
              ).filter((b) =>
                b.nome
                  .toLowerCase()
                  .includes(
                    (
                      searchAno[
                        ano._id
                      ] || ""
                    ).toLowerCase()
                  )
              );

            return (
              <AccordionItem
                key={ano._id}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                mb={2}
                overflow="hidden"
              >

                {/* ANO */}

                <AccordionButton
                  px={{
                    base: 3,
                    md: 4,
                  }}
                  py={4}
                  _hover={{
                    bg: "gray.50",
                  }}
                >

                  <Box
                    flex="1"
                    textAlign="left"
                    fontWeight="bold"
                    fontSize={{
                      base: "sm",
                      md: "md",
                    }}
                  >
                    {ano._id} - Total:{" "}
                    {
                      batizadosFiltrados.length
                    }
                  </Box>

                  <AccordionIcon />

                </AccordionButton>

                {/* CONTEÚDO */}

                <AccordionPanel
                  pb={4}
                  px={{
                    base: 3,
                    md: 4,
                  }}
                >

                  {/* PESQUISA */}

                  <Box
                    mb={4}
                    w="100%"
                    maxW="400px"
                  >
                    <InputGroup>

                      <InputLeftElement
                        pointerEvents="none"
                      >
                        <SearchIcon
                          color="gray.400"
                        />
                      </InputLeftElement>

                      <Input
                        pl={10}
                        size="md"
                        placeholder="Pesquisar por nome..."
                        value={
                          searchAno[
                            ano._id
                          ] || ""
                        }
                        onChange={(e) =>
                          setSearchAno(
                            (prev) => ({
                              ...prev,
                              [ano._id]:
                                e.target.value,
                            })
                          )
                        }
                      />

                    </InputGroup>
                  </Box>

                  {/* LISTA */}

                  <List spacing={3}>

                    {batizadosFiltrados.length ===
                    0 ? (

                      <Text
                        color="gray.500"
                        textAlign="center"
                        py={5}
                        fontSize={{
                          base: "sm",
                          md: "md",
                        }}
                      >
                        Nenhum batizado
                        encontrado.
                      </Text>

                    ) : (

                      batizadosFiltrados.map(
                        (b) => (

                          <ListItem
                            key={b._id}
                            p={{
                              base: 3,
                              md: 4,
                            }}
                            bg="gray.50"
                            rounded="md"
                            border="1px solid"
                            borderColor="gray.200"
                          >

                            <Flex
                              direction={{
                                base: "column",
                                sm: "row",
                              }}
                              justify="space-between"
                              align={{
                                base: "stretch",
                                sm: "center",
                              }}
                              gap={3}
                            >

                              {/* INFORMAÇÕES */}

                              <VStack
                                align="start"
                                spacing={1}
                                flex="1"
                                minW={0}
                              >

                                <Text
                                  fontWeight="bold"
                                  fontSize={{
                                    base: "sm",
                                    md: "md",
                                  }}
                                  wordBreak="break-word"
                                >
                                  {b.nome}
                                </Text>

                                <Text
                                  fontSize={{
                                    base: "xs",
                                    md: "sm",
                                  }}
                                  color="gray.600"
                                >
                                  Idade:{" "}
                                  {b.idade}
                                </Text>

                                <Text
                                  fontSize={{
                                    base: "xs",
                                    md: "sm",
                                  }}
                                  color="gray.600"
                                >
                                  Data:{" "}
                                  {new Date(
                                    b.dataBatismo
                                  ).toLocaleDateString()}
                                </Text>

                              </VStack>

                              {/* BOTÕES */}

                              <HStack
                                spacing={2}
                                justify={{
                                  base: "flex-end",
                                  sm: "initial",
                                }}
                                flexShrink={0}
                              >

                                <IconButton
                                  icon={
                                    <EditIcon />
                                  }
                                  size={{
                                    base: "md",
                                    md: "sm",
                                  }}
                                  colorScheme="yellow"
                                  onClick={() =>
                                    handleEdit(
                                      b
                                    )
                                  }
                                  aria-label="Editar batizado"
                                />

                                <IconButton
                                  icon={
                                    <DeleteIcon />
                                  }
                                  size={{
                                    base: "md",
                                    md: "sm",
                                  }}
                                  colorScheme="red"
                                  onClick={() =>
                                    handleDelete(
                                      b._id
                                    )
                                  }
                                  aria-label="Deletar batizado"
                                />

                              </HStack>

                            </Flex>

                          </ListItem>

                        )
                      )

                    )}

                  </List>

                </AccordionPanel>

              </AccordionItem>
            );
          })}

        </Accordion>

      </Box>

    </Box>
  );
};

export default Batizados;