
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";
import { getStudents, getStudentById, calculateDeptStats, performCustomAggregation } from "./mockDatabase";

const API_KEY = process.env.API_KEY || "";

const getStudentsTool: FunctionDeclaration = {
  name: "get_students",
  description: "Retrieves a list of students, optionally filtered by department or minimum GPA.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      department: { type: Type.STRING, description: "Filter by department name (e.g., 'Computer Science')." },
      minGpa: { type: Type.NUMBER, description: "Filter by minimum GPA threshold." },
    },
  },
};

const getStudentDetailsTool: FunctionDeclaration = {
  name: "get_student_details",
  description: "Gets detailed information for a specific student using their ID.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      studentId: { type: Type.STRING, description: "The student ID (e.g., 'S101')." },
    },
    required: ["studentId"],
  },
};

const getDepartmentStatsTool: FunctionDeclaration = {
  name: "get_department_stats",
  description: "Calculates average GPA and total student count for a specific department.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      department: { type: Type.STRING, description: "The department name." },
    },
    required: ["department"],
  },
};

const calculateCustomAggregationTool: FunctionDeclaration = {
  name: "calculate_custom_aggregation",
  description: "Calculates aggregate stats (Avg GPA, Total Credits) for a specific set of student IDs.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      studentIds: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "An array of student IDs to aggregate."
      },
    },
    required: ["studentIds"],
  },
};

export const chatWithAgent = async (message: string, history: any[] = []) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Convert history to Gemini format
  const contents = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }]
  }));

  contents.push({ role: 'user', parts: [{ text: message }] });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents,
      config: {
        systemInstruction: `You are a helpful University Data Agent. 
        You have access to a student database and analytics tools.
        When asked about students, grades, or departments, use the provided tools.
        If a user query is ambiguous (e.g., "Tell me about the department"), ask for the specific department name.
        Always provide a concise and professional summary of the data you retrieve.
        Deterministic math is handled by your tools; trust their output over your internal calculations.
        If a user asks for a student you can't find, inform them politely.`,
        tools: [{
          functionDeclarations: [
            getStudentsTool,
            getStudentDetailsTool,
            getDepartmentStatsTool,
            calculateCustomAggregationTool
          ]
        }],
      },
    });

    let finalResponseText = response.text || "";
    
    // Handle Function Calling
    if (response.functionCalls && response.functionCalls.length > 0) {
      const toolResponses: any[] = [];
      
      for (const call of response.functionCalls) {
        let result;
        switch (call.name) {
          case "get_students":
            result = getStudents(call.args.department as string, call.args.minGpa as number);
            break;
          case "get_student_details":
            result = getStudentById(call.args.studentId as string);
            break;
          case "get_department_stats":
            result = calculateDeptStats(call.args.department as string);
            break;
          case "calculate_custom_aggregation":
            result = performCustomAggregation(call.args.studentIds as string[]);
            break;
          default:
            result = { error: "Unknown tool call" };
        }
        
        toolResponses.push({
          id: call.id,
          name: call.name,
          response: { result },
        });
      }

      // Send tool results back to the model for final summary
      const secondResponse = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: [
          ...contents,
          { 
            role: "model", 
            parts: response.candidates[0].content.parts 
          },
          {
            role: "user",
            parts: toolResponses.map(tr => ({
              functionResponse: tr
            }))
          }
        ],
      });
      
      finalResponseText = secondResponse.text || "I processed your request, but I couldn't generate a text summary.";
    }

    return finalResponseText;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again.";
  }
};
